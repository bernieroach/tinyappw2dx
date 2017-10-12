let express = require('express');
let app = express();
let PORT = process.env.PORT || 8080;
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');


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



const verifyRegEmailPassword = function(email, password, userList){
  const result = { OK : true,
                   messages : [] };
  // verify username is not empty

  if(!email){
    result.messages.push("username cannot be blank")
    result.OK = false;
  }
    // verify password is not empty

  if(!password){
    result.messages.push("password cannot be blank");
    result.OK = false;
  }
  // verify username is not already in the list of users
  for (let id in userList){
    if(userList[id].email == email){
      result.messages.push(`username with email: ${email} - already registered`);
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
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "richardthaler": {
    id: "richardthaler",
    email: "rthaler@example.com",
    password: "econhavenosould"
  },
  "charlierose": {
    id: "charlierose",
    email: "charlierose@example.com",
    password: "conversation"
  }
}


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs')

app.get("/",(req,res) =>{
  res.render("register");
});


app.get("/urls",(req,res)=>{
// look for a cookie value
  let templateVars = {urls: urlDatabase,
                      username : req.cookies.username,
                      user : users[req.cookies.user_id]
                      };
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req,res)=>{
  let templateVars = { username : req.cookies.username,
                       user : req.cookies.user_id }
  res.render("urls_new", templateVars);
});

 app.get("/urls.json",(req,res) =>{
   res.json(urlDatabase);
 });

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase,
                       username : req.cookies.username,
                       user : users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req,res) => {
  res.end("<html><body>Hello</body><html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = urlDatabase[shortURL]

  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/register",(req,res)=>{
  res.render("register");
});

app.get("/users",(req,res)=>{
  let templateVars = { users : users };
  res.render("users", templateVars);
});


app.get("/login",(req,res)=>{
  templateVars = { username : req.cookies.username }
  res.render("login", templateVars);

});



// delete database entry of tiny url by id
app.post("/urls/:id/delete",(req,res) =>{
  // this is where we delete the entry in the database
  delete urlDatabase[req.params.id];
res.redirect("/urls");
//  res.send(`delete ${req.params.id}...`);
});

// delete database entry of tiny url by id
app.post("/urls/:id/update",(req,res) =>{
  // this is where we delete the entry in the database
  urlDatabase[req.params.id] = `http://${req.body.longURL}`;
// go back to main
res.redirect("/urls")
//  res.send(`delete ${req.params.id}...`);
});

app.post("/urls", (req, res) => {

  // console.log(req.body);  // debug statement to see POST parameters
 // generate a short URL
//  const shortURL = generateRandomString();

  // short URL will be the key for the long URL
    urlDatabase[generateRandomString()] = `http://${req.body.longURL}`;
    // go back to main
    res.redirect("/urls");
});

app.post("/login", (req, res) => {

  // login logic.
  // update the cookie and then enter the index page
  res.cookie('username', req.body.username);
  // username will be email.
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {

  // login logic.
  // update the cookie and then enter the index page
  res.clearCookie('username');
  res.redirect("/urls");

});

app.post("/register",(req,res)=>{
  // register the user with email and password.
  let randID = generateRandomString();

  // error handling

  let userVerifyResult = verifyRegEmailPassword(req.body.email, req.body.password, users);
  if (userVerifyResult.OK == true){
  users[randID] = { id : randID,
                    email : req.body.email,
                    password : req.body.password
                   }
  res.cookie('user_id', randID);
  res.redirect("/urls");
  } else {
    res.status(400).send(userVerifyResult.messages.toString());
  }
  //let templateVars = { users : users };
  // check for users list during test res.render("users",templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});

