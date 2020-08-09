const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Champion Data Schema
const championSchema = new Schema({
  id:  Number,
  name: String,
  image:   URL,
  skins: Number
});

// User Data Schema
const userSchema = new Schema({
    username: {
        required: true,
        type: String,
    },
    highscore: Number
});

// Mongoose model objects that user our defined Schema
const Champion = mongoose.model('Champion', championSchema);
const User = mongoose.model('User', userSchema);

// Export sed Objects
module.exports = {
    Champion,
    User,
};