'use strict';

var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/sandbox");

var db = mongoose.connection;

db.on("error", (err) => {
  console.log("there was an error:", err);
});

db.once("open", () => {
  console.log("DB connection successful");
  // all code to communicate with db

  var Schema = mongoose.Schema;
  var AnimalSchema = new Schema({
    type: {type: String, default: "goldfish"},
    size: String,
    color: {type: String, default: "golden"},
    mass: {type: Number, default: 1},
    name: {type: String, default: "Angela"}
  });

  AnimalSchema.pre("save", function(next) {
    if (this.mass >= 100) {
      this.size = "Big";
    } else if (this.mass >= 5 && this.mass < 100) {
      this.size = "Medium";
    } else {
      this.size = "Small";
    }
    next();
  });

  AnimalSchema.statics.findSize = function(size, cb) {
    return this.find({size: size}, cb)
  };

  AnimalSchema.methods.findSameColor = function(cb) {
    return this.model("Animal").find({color: this.color}, cb);
  };

  var Animal = mongoose.model("Animal", AnimalSchema)

  var elephant = new Animal({
    type: "Elephant",
    color: "Grey",
    mass: 6000,
    name: "Dumbo"
  });

  var animal = new Animal({});

  var whale = new Animal({
    type: "Whale",
    mass: 190500,
    name: "Figg"
  });

  var animalData = [
    {
      type: "Mouse",
      color: "Grey",
      mass: 2,
      name: "Basil"
    },
    {
      type: "Nutria",
      color: "Brown",
      mass: 15.04,
      name: "Gretchen"
    },
    {
      type: "Wolf",
      color: "Grey",
      mass: 45,
      name: "Iris"
    },
    elephant,
    animal,
    whale
  ];

  Animal.remove({}, (err) => {
    if (err) console.log(err)
    Animal.create(animalData, (err) => {
      if (err) console.log("save failed, error:", err);
      Animal.findOne({type: "Elephant"}, (err, elephant) => {
        elephant.findSameColor(function(err, res) {
          if (err) console.log("save failed, error:", err);
          res.forEach((a) => {
            console.log(a.name + " the " + a.color + " " + a.type + " is a " + a.size + "-sized animal.");
          });
          db.close(() => {
            console.log("db connection closed");
          });
        })
      });
    });
  });
});
