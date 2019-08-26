var mongoose = require("mongoose");
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");
var fileUpload = require('express-fileupload');

var Project = require("./project-model");
var Type = require("./type-model");

//setup database connection
var connectionString =
  "mongodb://projectAdmin:projectAdmin12345@cluster0-shard-00-00-1yj9q.mongodb.net:27017,cluster0-shard-00-01-1yj9q.mongodb.net:27017,cluster0-shard-00-02-1yj9q.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(connectionString, { useNewUrlParser: true });
var db = mongoose.connection;
db.once("open", () => console.log("Database connected"));
db.on("error", () => console.log("Database error"));

//setup express server
var app = express();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(fileUpload());
app.use(logger("dev"));
app.use(express.static('public'));

//setup routes
var router = express.Router();

router.get("/testing", (req, res) => {
  res.send("<h1>Testing is working</h1>");
});

router.get("/projects", (req, res) => {
  Project.find().then(projects => {
    return res.json(projects);
  });
});

router.get("/projects/:id", (req, res) => {
  Project.findOne({ id: req.params.id }).then(project => {
    return res.json(project);
  });
});

router.post("/projects", (req, res) => {
  var project = new Project();
  project.id = Date.now();

  var data = req.body;
  Object.assign(project, data);
  // same as var newItem = {...item,...extra}

  project.save().then(project => {
    return res.json(project);
  });
});

router.post("/upload", (req, res) => {
  var files = Object.values(req.files);
  var uploadedFile = files[0]; //assuming they are uploading one file
  // console.log(uploadedFile);
              // .mv('name of file', callback function)

  var newName = Date.now() + uploadedFile.name;
  uploadedFile.mv('public/'+ newName, () =>{
    res.send(newName);
  });

});

router.delete("/projects/:id", (req, res) => {
  Project.deleteOne({ id: req.params.id }).then(() => {
    return res.json("deleted");
  });
});

router.put("/projects/:id", (req, res) => {
  Project.findOne({ id: req.params.id })
    .then(project => {
      var data = req.body;
      Object.assign(project, data);
      return project.save();
    })
    .then(project => {
      return res.json(project);
    });
});

router.get("/types", (req, res) => {
  Type.find().then((types)=>{
    return res.json(types);
  });
});



app.use("/api", router); // you can change prefix from api to something else

// launch our backend into a port
const apiPort = 3001;
app.listen(apiPort, () => console.log("Listening on port " + apiPort));
