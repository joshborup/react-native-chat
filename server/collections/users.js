const mongoose = require("mongoose");

const users = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rooms",
      unique: true
    }
  ]
});

module.exports = mongoose.model("user", users);
