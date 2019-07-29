const mongoose = require("mongoose");

const message = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  }
});

const rooms = mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  chatHistory: [message]
});

module.exports = mongoose.model("room", rooms);
