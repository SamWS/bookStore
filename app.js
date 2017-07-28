"use strict";

var express = require("express");
var app = express();
var routes = require("./routes.js");

var logger = require("morgan");
var jsonParser = require("body-parser").json;

app.use(logger("dev"));
app.use(jsonParser());

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/qa");

var db = mongoose.connection;

db.on("error", err => {
  console.log("there was an error:", err);
});

db.once("open", () => {
  console.log("DB connection successful");
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Acces-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use("/questions", routes);

app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Express server is litening on port " + port);
});
