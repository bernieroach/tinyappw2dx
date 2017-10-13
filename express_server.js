// tinyURL app for LHL week 2
// Oct 10, 2017 Montreal QC
// Bernard Roach
//
// Global data declarations:
// put this in a module with
// getUserByID
// verifyRegEmailPassword
// getUSerByEmail
// getLongURLfromShort

// more app functions are:
// userLogin
// userLogOut (not written)
// userRegister (not written)
// userUpdate (not written)
// userDelete (not written)


// global function declarations
// try to modularize later when it is working.
// idea is data stuff in data (get/delete/update etc)
// idea is helper functions in a separate moduel (like generate random)
// helper functions might be called via the db module
//(not visible to the app maybe? it should not be called from the app directly in our example I think)
// idea that the 'functional' functions - like logon, register can stay with the app as it is at app level
// so if db changes or whatever, the app should not have to be changed much, unless we want the app to
// acutally function differently


// multi language texts object?
// // language selection (possible cookie to store)
// try if time
//  appTexts = { userBlank : {
//                             { lang : "EN",
//                               text : "cannot leave user name blank"\
//                             },
//                             { lang : "FR",
//                               text : "veuillez entrer un nom utilisateur"
//                             }
//               },
//               passwordBlank : {
//                             { lang : "EN",
//                               text : "cannot leave password blank"\
//                             },
//                             { lang : "FR",
//                               text : "veuillez entrer un mot de passe"
//                             }

//               }
//             }


///////// require statements //////////

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

let getLongURLfromShort = function(shortURL, userList){
  for (let userID in userList){

// loop through all the registerd users
// let longURL = urlDatabase[shortURL]
// hash the user db tiny
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
                      "b2xVn2": "http://www.lighthouselabs.ca",
                      "9sm5xK": "http://www.google.com"
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

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({name : 'session',
                       keys : [digest]}));
app.set('view engine', 'ejs')

app.get("/",(req,res) =>{

  templateVars = { user : users[req.session.user_id] }
  if(!req.session.user_id){
    res.render("login",templateVars);
  } else {
    templateVars.urls = urlDatabase[req.session.user_id];
    res.redirect("/urls");
  }
});


app.get("/urls",(req,res)=>{

  let templateVars = {
                      user :    users[req.session.user_id]
                      };
  if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  } else {
    templateVars.urls = urlDatabase[req.session.user_id];
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new",(req,res)=>{

  let templateVars = { user :    users[req.session.user_id] }

  if(req.session.user_id){
    res.render("urls_new", templateVars);
  } else {

    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase[req.session.user_id],
                       user : users[req.session.user_id] };

 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
    } else if(urlDatabase[req.session.user_id][req.params.id]){

  res.render("urls_show", templateVars);
  } else {
    // if user is not logged in:
    templateVars.errMessages = `**You are not the owner of tinyURL ${req.params.id}. **`;
    res.render("error_message",templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = getLongURLfromShort(req.params.shortURL,users);
  let templateVars = { user : users[req.session.user_id] }
  if(longURL){
    res.redirect(longURL);
  } else {
    templateVars.errMessages = `**No Entry found for ${req.params.shortURL} . **`;
    res.render("error_message",templateVars);
    // not found
  }
});

app.get("/register",(req,res)=>{
// need this or header explodes
  let templateVars = { user : users[req.session.user_id] }

  if(req.session.user_id){
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// test to be removed
app.get("/users",(req,res)=>{
  let templateVars = { users : users,
                       user : users[req.session.user_id] };
  res.render("users", templateVars);
});


app.get("/login",(req,res)=>{
// what to do if already logged in?

  templateVars = { user : users[req.session.user_id] }
  if(!req.session.user_id){
    res.clearCookie("user_id");
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }

});

app.get("/logout", (req, res) => {

req.session.user_id = "";
  res.redirect("/login");

});

// delete database entry of tiny url by id
app.post("/urls/:id/delete",(req,res) =>{
  let templateVars = { user : users[req.session.user_id] };
 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
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
app.post("/urls/:id",(req,res) =>{
  let templateVars = { user : users[req.session.user_id] };

 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  } else if (!urlDatabase[req.session.user_id][req.params.id]){
    templateVars.errMessages = `**You do not own tinyURL ${req.params.id} ACTION CANCELLED **`;
    res.render("error_message",templateVars);
  } else {
    urlDatabase[req.session.user_id][req.params.id] = `http://${req.body.longURL}`;
    res.redirect("/urls")
  }
});

app.post("/urls", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase[req.session.user_id],
                       user : users[req.session.user_id] };

 if(!req.session.user_id){
    templateVars.errMessages = "**You are not logged in. Please log in**";
    res.render("error_message",templateVars);
  } else {
  // console.log(req.body);  // debug statement to see POST parameters
 // generate a short URL
   const shortURL = generateRandomString();

  // short URL will be the key for the long URL
  //  urlDatabase[req.session.user_id][shortURL]= `http://${req.body.longURL}`;
   urlDatabase[req.session.user_id][shortURL]= shortURL;
    // go tiny url page
    res.redirect(`/urls/${shortURL}`);
  }

});

app.post("/login", (req, res) => {

  let loginResult = userLogin(req.body.email, req.body.password, users);

  if (loginResult.OK == true){
// OK
  req.session.user_id = loginResult.user.id;

  res.redirect("/urls");
  } else {
// return error
   res.status(loginResult.status).send(loginResult.messages)
  }


});

app.post("/logout", (req, res) => {

  req.session.user_id = "";
// this commented out part is the spec, but I don't like it.
//  res.redirect("/urls");
  res.redirect("/login");
});

app.post("/register",(req,res)=>{
  // register the user with email and password.

  let userVerifyResult = verifyRegEmailPassword(req.body.email, req.body.password, users);
  if (userVerifyResult.OK == true){


  let randID = generateRandomString();
  users[randID] = { id : randID,
                    email : req.body.email,
                    password : bcrypt.hashSync(req.body.password, saltRounds)
                   }

  urlDatabase[randID] = {};
  req.session.user_id = randID;

  res.redirect("/urls");
  } else {
    res.status(userVerifyResult.status).send(userVerifyResult.messages);
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});



