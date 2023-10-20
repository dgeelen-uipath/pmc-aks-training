// Importing express.js module 
const fs = require("fs"); 
const express = require("express"); 
const bodyParser = require("body-parser"); // Add this
const crypto = require('crypto');

// Creating an express.js application 
const app = express(); 

app.use(bodyParser.json()); // And this

const todoPath = "/data";
var nextId = () => crypto.randomUUID();

function parseGuid(id)
{
  const uuidRegExp = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-4[0-9a-fA-F]{3}\-[89abAB][0-9a-fA-F]{3}\-[0-9a-fA-F]{12}$/;
  if (!uuidRegExp.test(id))
    throw "bad request"; // TODO: make actual 400 response
  return id;
}

function todoFile(id)
{
  return `${todoPath}/${parseGuid(id)}.json`;
}

function log_endpoint(url)
{
  console.log(`[${new Date()}] [${process.env["HOSTNAME"]}] ${url}`)
}

app.use(function(req, res, next) {
  log_endpoint(req.path);
  next();
});

// Defining request response in root URL (/)
app.get("/api/todo", function(req, res) {
  fs.readdir(todoPath, function (err, files) {
    //handling error
    if (err) {
      log_endpoint(err);
      return res.status(500).send('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    res.send(JSON.stringify(files.map(f => JSON.parse(fs.readFileSync(`${todoPath}/${f}`)))));
  });
});

app.get("/api/todo/:id", function(req, res) {
  const file = todoFile(req.params.id);
  if (fs.existsSync(file)) {
    res.send(fs.readFileSync(file));
  } else {
    res.status(404).send("Todo not found");
  }
});

app.post("/api/todo", function(req, res) {
  var id = nextId();
  fs.writeFileSync(todoFile(id), JSON.stringify({ ...req.body, id }));
  res.send(JSON.stringify(id));
});

app.put("/api/todo/:id", function(req, res) {
  const file = todoFile(req.params.id);
  if (fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ ...req.body, id }));
    res.status(200).send(`Todo ID: ${req.params.id} has been updated`);
  } else {
    res.status(404).send("Todo not found");
  }
});

app.delete("/api/todo/:id", function(req, res) {
  const file = todoFile(req.params.id);
  if (fs.existsSync(file)) {  
    fs.unlinkSync(todoFile(req.params.id));
    res.status(200).send(`Todo ID: ${req.params.id} has been deleted`);
  } else {
    res.status(404).send("Todo not found");
  }
});

// Launch listening server on port 3000
app.listen(3000, function() {
  console.log("App listening on port 3000!");
});