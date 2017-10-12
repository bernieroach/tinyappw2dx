let express = require('express');
let app = express();
let PORT = process.env.PORT || 8080;
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let bcrypt = require('bcrypt');
const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);


// global function declarations
// try to modularize later when it is working.
// idea is data stuff in data (get/delete/update etc)
// idea is helper functions in a separate moduel (like generate random)
// helper functions might be called via the db module
//(not visible to the app maybe? it should not be called from the app directly in our example I think)
// idea that the 'functional' functions - like logon, register can stay with the app as it is at app level
// so if db changes or whatever, the app should not have to be changed much, unless we want the app to
// acutally function differently

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
 return shortURL;
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



// Global data declarations:
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
    password: bcrypt.hashSync("conversation", saltRounds) //"conversation"
  }
}


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs')

app.get("/",(req,res) =>{
  templateVars = { user : users[req.cookies.user_id] }
  res.render("login",templateVars);
});


app.get("/urls",(req,res)=>{
// look for a cookie value
  let templateVars = {urls: urlDatabase[req.cookies.user_id],
                      user :    users[req.cookies.user_id]
                      };
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req,res)=>{
  let templateVars = { user :    users[req.cookies.user_id] }
  // if the user is registered and logged on then ok to create new URL
  if(templateVars.user){
  res.render("urls_new", templateVars);
  } else {
  // redirect to login
  res.render("login", templateVars);
  }
});

 app.get("/urls.json",(req,res) =>{
   res.json(urlDatabase);
 });

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase[req.cookies.user_id],
                       user : users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req,res) => {
  res.end("<html><body>Hello</body><html>\n");
});

app.get("/u/:shortURL", (req, res) => {


  res.redirect(getLongURLfromShort(req.params.shortURL,users));
// loop through all the registerd users
// hash the user db tiny
 // let longURL = urlDatabase[shortURL]

//  res.redirect(urlDatabase[req.cookies.user_id][req.params.shortURL]);
});

app.get("/register",(req,res)=>{
  let templateVars = { user : users[req.cookies.user_id] }
  res.render("register", templateVars);
});

app.get("/users",(req,res)=>{
  let templateVars = { users : users,
                       user : users[req.cookies.user_id] };
  res.render("users", templateVars);
});


app.get("/login",(req,res)=>{
// what to do if already logged in?

  templateVars = { user : users[req.cookies.user_id] }
  if(!templateVars.user){
    res.clearCookie("user_id");
  }
  res.render("login", templateVars);

});

app.get("/logout", (req, res) => {

  // login logic.
  // update the cookie and then enter the index page
res.clearCookie("user_id");

  res.redirect("/login");

});

// delete database entry of tiny url by id
app.post("/urls/:id/delete",(req,res) =>{
  // this is where we delete the entry in the database
  delete urlDatabase[req.cookies.user_id][req.params.id];
res.redirect("/urls");
//  res.send(`delete ${req.params.id}...`);
});

// delete database entry of tiny url by id
app.post("/urls/:id/update",(req,res) =>{
  // this is where we delete the entry in the database
  urlDatabase[req.cookies.user_id][req.params.id] = `http://${req.body.longURL}`;
// go back to main
res.redirect("/urls")
//  res.send(`delete ${req.params.id}...`);
});

app.post("/urls", (req, res) => {

  // console.log(req.body);  // debug statement to see POST parameters
 // generate a short URL
   const shortURL = generateRandomString();

  // short URL will be the key for the long URL
    urlDatabase[req.cookies.user_id][shortURL]= `http://${req.body.longURL}`;
    // go back to main
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // login logic.
  // verifythe login
  // check for user with email address
  // check the password is correct
  let loginResult = userLogin(req.body.email, req.body.password, users);

  if (loginResult.OK == true){
// OK

  // update the cookie and then enter the index page
  res.cookie('user_id', loginResult.user.id);

  //  will be email.
  res.redirect("/urls");
  } else {
// return error
   res.status(loginResult.status).send(loginResult.messages)
  }


});

app.post("/logout", (req, res) => {

  // login logic.
  // update the cookie and then enter the index page
res.clearCookie(user_id);

  res.redirect("/login");

});

app.post("/register",(req,res)=>{
  // register the user with email and password.


  // error handling
// hash the password


  let userVerifyResult = verifyRegEmailPassword(req.body.email, req.body.password, users);
  if (userVerifyResult.OK == true){


  let randID = generateRandomString();
  users[randID] = { id : randID,
                    email : req.body.email,
                    password : bcrypt.hashSync(req.body.password, saltRounds)
                   }

  urlDatabase[randID] = {};
  res.redirect("/urls");
  } else {
    res.status(userVerifyResult.status).send(userVerifyResult.messages);
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});



