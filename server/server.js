// Importing express.js module 
const fs = require("fs"); 
const express = require("express"); 
const bodyParser = require("body-parser"); // Add this
const crypto = require('crypto');
const http = require('https');

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

app.get("/api/version", function(req, res) {
  res.send(3);
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

app.post("/api/pi", function(req, res) {
  var count = req.body.count || 1000000;
  var inside = 0;
  for (var c = 0; c < count; ++c) {
    var x = crypto.randomInt(1000000) / 1000000;
    var y = crypto.randomInt(1000000) / 1000000;
    var z = Math.sqrt(x*x + y*y);
    if (z < 1)
      ++inside;    
  }
  
  res.send(JSON.stringify(Math.sqrt(inside / count)));
});

app.get("/api/pods", function(req, res) {
  var options = {
    hostname: 'kubernetes.default.svc.cluster.local',
    port: 443,
    path: `/api/v1/namespaces/${fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/namespace', 'utf8')}/pods`,
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8')
    },
    rejectUnauthorized: false // This should only be false in local testing. In production, it should be 'true'
  };

  var kreq = http.request(options, (kres) => {
      kres.setEncoding('utf8');
      var allData = "";
      
      kres.on('data', (chunk) => {
        allData += chunk;
          console.log(`Received data: ${chunk}`);
      });
      
      kres.on('end', () => {
        res.status(200).send(allData);
          console.log('No more data in response.');
      })
  });

  kreq.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  kreq.end();
});

// Launch listening server on port 3000
app.listen(3000, function() {
  console.log("App listening on port 3000!");
});