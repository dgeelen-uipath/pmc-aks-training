// Importing express.js module 
const fs = require("fs"); 
const express = require("express"); 
const bodyParser = require("body-parser"); // Add this

// Creating an express.js application 
const app = express(); 

app.use(bodyParser.json()); // And this

const todos = {};
var nextId = 0;

function log_endpoint(url)
{
  console.log(`[${new Date()}] [${process.env["HOSTNAME"]}] accessing: ${url}`)
}

app.use(function(req, res, next) {
  log_endpoint(req.path);
  next();
});

// Defining request response in root URL (/)
app.get("/", function(req, res) {
    res.set('Content-Type', 'text/html');
    res.send(fs.readFileSync('./index.html'));
});

// Defining request response in root URL (/)
app.get("/api/todo", function(req, res) {
  res.send(JSON.stringify(Object.keys(todos).map(x => todos[x])));
});

app.get("/api/todo/:id", function(req, res) {
  const todo = todos[req.params.id];
  if (todo) {
    res.send(JSON.stringify(todo));
  } else {
    res.status(404).send("Todo not found");
  }
});

app.post("/api/todo", function(req, res) {
  var id = ++nextId;
  todos[id] = { ...req.body, id };
  res.send(JSON.stringify(id));
});

app.put("/api/todo/:id", function(req, res) {
  const todo = todos[req.params.id];
  if (todo) {
    todos[req.params.id] = { ...req.body, id: req.params.id };
    res.status(200).send(`Todo ID: ${req.params.id} has been updated`);
  } else {
    res.status(404).send("Todo not found");
  }
});

app.delete("/api/todo/:id", function(req, res) {
  if (todos[req.params.id]) {
    delete todos[req.params.id];
    res.status(200).send(`Todo ID: ${req.params.id} has been deleted`);
  } else {
    res.status(404).send("Todo not found");
  }
});

// Launch listening server on port 3000
app.listen(3000, function() {
  console.log("App listening on port 3000!");
});