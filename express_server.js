let express = require('express');
let app = express();
let PORT = process.env.PORT || 8080;
let bodyParser = require('body-parser');


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


const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};


app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')

app.get("/",(req,res) =>{
  res.end("Hi!");
});


app.get("/urls",(req,res)=>{
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req,res)=>{
  res.render("urls_new");
});

 app.get("/urls.json",(req,res) =>{
   res.json(urlDatabase);
 });

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       urlDatabase : urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req,res) => {
  res.end("<html><body>Hello</body><html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = urlDatabase[shortURL]
  res.redirect(urlDatabase[req.params.shortURL]);
});

// delete database entry of tiny url by id
app.post("/urls/:id/delete",(req,res) =>{
  // this is where we delete the entry in the database
  console.log(urlDatabase);
  delete urlDatabase[req.params.id];
  console.log(urlDatabase);
res.json(urlDatabase);
//  res.send(`delete ${req.params.id}...`);
});

// delete database entry of tiny url by id
app.post("/urls/:id/update",(req,res) =>{
  // this is where we delete the entry in the database
  console.log(urlDatabase);
  urlDatabase[req.params.id] = `http://${req.body.bernielongURL}`;
  console.log(urlDatabase);
res.json(urlDatabase);
//  res.send(`delete ${req.params.id}...`);
});

app.post("/urls", (req, res) => {

  // console.log(req.body);  // debug statement to see POST parameters
 // generate a short URL
//  const shortURL = generateRandomString();

  // short URL will be the key for the long URL
    urlDatabase[generateRandomString()] = `http://${req.body.longURL}`;
    res.json(urlDatabase);
//  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port: ${PORT}!`);
});
