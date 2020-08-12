require("dotenv").config({ path: "../.env" });
const Schema = require("mongoose").Schema;
const mongoose = require("mongoose");

// Connection to MongoDB
const uri = process.env.DB_CONNECTION;
mongoose.connect(uri, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const championSchema = new Schema({
  version: String,
  id: String,
  key: String,
  name: String,
  title: String,
  blurb: String,
  image: String,
  skinCount: Number,
});

const userSchema = new Schema({
  username: {
    required: true,
    type: String,
  },
  highscore: Number,
});

const Champion = db.model("Champion", championSchema);
const User = db.model("User", userSchema);

module.exports = {
  Champion,
  User,
};
