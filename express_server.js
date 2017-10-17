// tinyURL app for LHL week 2
// Oct 10, 2017 Montreal QC
// Bernard Roach

///////// require statements //////////
let methodOverride = require('method-override');
let express = require('express');
let app = express();
let PORT = process.env.PORT || 8080;
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let cookieSession = require('cookie-session');
let bcrypt = require('bcrypt');


//////// function declarations ///////////

const generateRandomString = function(){
  // list of valid characters the random sequence can be composed of a-z + A-Z + 0-9 order doesn't matter
  const aToZ = "qwertyuiopasdfghjklzxcvbnm";
  // literal template
  const validChars = `1234567890${aToZ}${aToZ.toUpperCase()}`;
  let randomString = "";
  let numberOfChars = 16;

// choose n number of chars randomly from the list of valid characters
  for(let i = 0 ; i < numberOfChars ; i++){
     randomString += validChars.charAt(Math.floor(Math.random()*validChars.length))
  }
  return(randomString);
}


// DATA functions

let getURLfromShort = function(shortURL, userList){
  for (let userID in userList){

  if (urlDatabase[userID] && urlDatabase[userID][shortURL]) {
     return urlDatabase[userID][shortURL];
  }

 }
 // at this point the URL is not found, return the shortURL
 return "";
}

let getUserByEmail = function(email, userList){
  // verify  is not already in the list of users
  for (let id in userList){
    if(userList[id].email == email){
      return userList[id]
    }
  }
}


let userLogin = function(email, password, userList){

  const result = { OK : true,
                   status : 200,
                   messages : [] };
  // verify  is not empty

  if(!email){
    result.messages.push(" cannot be blank");
    result.status = 400;
    result.OK = false;
  }
    // verify password is not empty

  if(!password){
    result.messages.push("password cannot be blank");
    result.status = 400;
    result.OK = false;
  }
  if (result.OK){
  // verify  is not already in the list of users
    result.user = getUserByEmail(email, users);

    if (!result.user) {
      result.messages.push(`cannot find user for ${email}`);
      result.status = 403;
      result.OK = false;
    } else {
        if(!bcrypt.compareSync( password, result.user.password)) {

            result.messages.push(`incorrect password ${email}`);
            result.status = 403;
            result.OK = false;

        }
    }
  }
  return result;
}

const verifyRegEmailPassword = function(email, password, userList){
  const result = { OK : true,
                   status : 200,
                   messages : [] };
  // verify email is not empty

  if(!email){
    result.messages.push("email/username cannot be blank");
    result.status = 400;
    result.OK = false;
  }
    // verify password is not empty

  if(!password){
    result.messages.push("password cannot be blank");
    result.status = 400;
    result.OK = false;
  }
  // verify  is not already in the list of users
  for (let id in userList){
    if(userList[id].email == email){
      result.messages.push(` with email: ${email} - already registered`);
      result.status = 400;
      result.OK = false;
    }
  }

 return result;
}

let getUserByID = function(userID, userList){
  if(userList[userID]){
    return userList[userID];
  } else {
    return {};
  }
}

/////////// Global data declarations: /////////////

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const digest = generateRandomString();

const urlDatabase = { "charlierose" :
                      {
                      "b2xVn2": { longURL : "http://www.lighthouselabs.ca",
                                  visits : 4,
                                  visitors : {  "visitor1" : ["today","last week", "last year"],
                                                "visitor2" : ["first time"]
                                             }
                                },
                      "9sm5xK": { longURL : "http://www.google.com",
                                  visits : 1,
                                  visitors : {}
                                }
                      }
                    };

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  },
  "richardthaler": {
    id: "richardthaler",
    email: "rthaler@example.com",
    password: bcrypt.hashSync("econhavenosould", saltRounds)
  },
  "charlierose": {
    id: "charlierose",
    email: "charlierose@example.com",
    password: bcrypt.hashSync("conversation", saltRounds)
  }
}

//////// express server level functions ///////////
////// set up the server middleware, view engine //////

// override with POST having ?_method=DELETE
app.use(methodOverride('_bernieOverride'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({name : 'session',
                       keys : [digest]}));
app.set('view engine', 'ejs')

///////// GET behaviors  /////////

// root behavior for GET
app.get("/",(req,res) =>{

  let templateVars = { user : users[req.session.user_id] };
  // not logged on
  if(!req.session.user_id){
    res.render("login",templateVars);
  } else {
  // logged on, go to user urls
    templateVars.urls = urlDatabase[req.session.user_id];
    res.redirect("/urls");
  }
});

// /urls behavior for GET
app.get("/urls",(req,res)=>{
// get list of urls for a user

  let templateVars = { user : users[req.session.user_id] };
  // not logged on
  if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  } else {


    // get urls for user
    templateVars.urls = urlDatabase[req.session.user_id];

    res.render("urls_index", templateVars);
  }
});

// GET behavior for specific url for specific user
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase[req.session.user_id],
                       user : users[req.session.user_id] };

// not logged in
 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
    } else if(urlDatabase[req.session.user_id][req.params.id]){
  // the url is the user's - show it
  res.render("urls_show", templateVars);
  } else {
    // the url is not under the control of the user
    templateVars.errMessages = `**You are not the owner of tinyURL ${req.params.id}. **`;
    res.render("error_message",templateVars);
  }
});

// GET behavior for tinyURL redirection - the purpose of this service
app.get("/u/:shortURL", (req, res) => {
  const recordURL = getURLfromShort(req.params.shortURL,users);
  let templateVars = { user : users[req.session.user_id] }
  // if the longuRL is found redirect
  if(recordURL){
    recordURL.visits++;
// if it does not exist, create a uniqueTracker with a value of some randomnumber
    if(!req.session.trackerID){
      req.session.trackerID = generateRandomString();
      recordURL.visitors[req.session.trackerID] = [];

    }
// add or update the visitor list
    recordURL.visitors[req.session.trackerID].push(Date(Date.now()).toString());

    res.redirect(recordURL.longURL);
  } else {
    // not found
    templateVars.errMessages = `**No Entry found for ${req.params.shortURL} . **`;
    res.render("error_message",templateVars);
  }
});

// GET behavior for registration
app.get("/register",(req,res)=>{

  let templateVars = { user : users[req.session.user_id] }

  // already logged in, go to urls for user
  if(req.session.user_id){
    res.redirect("/urls");
  } else {
  // register
    res.render("register", templateVars);
  }
});

// GET behavior for login
app.get("/login",(req,res)=>{

  templateVars = { user : users[req.session.user_id] }
 // not logged in
  if(!req.session.user_id){
    res.clearCookie("user_id");
    res.render("login", templateVars);
  } else {
  // logged in, go to user urls
    res.redirect("/urls");
  }
});

//////// POST behaviors ////////

// delete database entry of tiny url by id
app.delete("/urls/:id/delete",(req,res) =>{
  let templateVars = { user : users[req.session.user_id] };
  // if not logged on
 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  // if user does not have control of url
  } else if (!urlDatabase[req.session.user_id][req.params.id]){
    templateVars.errMessages = `**You do not own tinyURL ${req.params.id} ACTION CANCELLED **`;
    res.render("error_message",templateVars);
  }else {
  // this is where we delete the entry in the database
    delete urlDatabase[req.session.user_id][req.params.id];
    res.redirect("/urls");
  }
});

// UPDATE database entry of tiny url by id
app.put("/urls/:id",(req,res) =>{

  let templateVars = { user : users[req.session.user_id] };
// not logged on
 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  // user does not have control of the url
  } else if (!urlDatabase[req.session.user_id][req.params.id]){
    templateVars.errMessages = `**You do not own tinyURL ${req.params.id} ACTION CANCELLED **`;
    res.render("error_message",templateVars);
  } else {

    console.log(urlDatabase[req.session.user_id][req.params.id]);
  // update the long URL and got ot the list of urls for the user
  // scrub the http: prefix and add later.
    req.body.longURL = req.body.longURL.replace("http://","");
    req.body.longURL = req.body.longURL.replace("https://","");
    urlDatabase[req.session.user_id][req.params.id].longURL = `http://${req.body.longURL}`;
    res.redirect("/urls")
  }
});


// create new tiny url entry
app.post("/urls", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase[req.session.user_id],
                       user : users[req.session.user_id] };
// not logged on
 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  } else {
 // generate a short URL
   const shortURL = generateRandomString();
// default tiny to point to itself
   urlDatabase[req.session.user_id][shortURL]= { longURL : shortURL,
                                                 visits : 0,
                                                 visitors : {}
                                                };
    // go tiny url page to update longURL
    res.redirect(`/urls/${shortURL}`);
  }

});

// POST behavior for login
app.post("/login", (req, res) => {

// check if the login was with valid data
  let loginResult = userLogin(req.body.email, req.body.password, users);

  if (loginResult.OK == true){
// OK
  req.session.user_id = loginResult.user.id;
// show urls for user
  res.redirect("/urls");
  } else {
// return error
   res.status(loginResult.status).send(loginResult.messages)
  }
});

// POST behavior for logout
app.post("/logout", (req, res) => {
// clear cookie and leave
  req.session.user_id = "";
// this commented out part is the spec, but I don't like it.
//  res.redirect("/urls");
  res.redirect("/login");
});

//POST behavior for
app.post("/register",(req,res)=>{
  // register the user with email and password.
  // check the registration inputs
  let userVerifyResult = verifyRegEmailPassword(req.body.email, req.body.password, users);
  if (userVerifyResult.OK == true){
  let randID = generateRandomString();
  // create user record
  users[randID] = { id : randID,
                    email : req.body.email,
                    password : bcrypt.hashSync(req.body.password, saltRounds)
                   }
// url database for user init to empty (but not undefined)
  urlDatabase[randID] = {};
  req.session.user_id = randID;
// show the urls for the user
  res.redirect("/urls");
  } else {
    // there was a data validity issue during registration
    res.status(userVerifyResult.status).send(userVerifyResult.messages);
  }
})

// express server behavior now defined.
// run the express server
app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});



