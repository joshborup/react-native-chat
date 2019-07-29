const mongoose = require("mongoose");

// let Sessions = new mongoose.Schema(
//   { expires: String, session: String },
//   { collection: "session" }
// );

// Sessions.find().then(sessions => {
//   console.log(sessions);
// });

module.exports = {
  get: function(handshake, next, db) {
    var sessionId = handshake.signedCookies["express.sid"];
    console.log(sessionId);
    if (db) {
      db.connection.db.collection("sessions", (err, collection) => {
        collection.find({ _id: sessionId }).toArray((err, session) => {
          console.log(session);
          if (session) {
            handshake.session = session[0];
            next();
          } else {
            next();
          }
        });
      });
    }
  }
};
