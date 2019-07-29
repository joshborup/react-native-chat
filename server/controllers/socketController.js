let id = 0;

const sessionService = require("../sessionService");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { saveMessage } = require("./messageController");
module.exports = function socketController(
  io,
  sessionSecret,
  connectionString
) {
  let db;

  mongoose
    .connect(connectionString, { useNewUrlParser: true, useCreateIndex: true })
    .then(databaseInstance => {
      db = databaseInstance;
    });

  return {
    mySocketFunc: socket => {
      console.log("hitsssssss", socket.id);

      socket.on("message", mes => {
        console.log({ id: id++, mes: mes });
        io.emit("message", { id: id++, mes: mes });
      });
      // code here lives as long as the socket session is alive
      let myCurrentRoom;
      let readableSession =
        socket.request.session && JSON.parse(socket.request.session.session);
      if (readableSession) {
        let user = readableSession.user;

        if (user.room) {
          myCurrentRoom = user.room;
          socket.join(user.room);
          io.in(user.room).emit("connectedToRoom", user.room);
        }
        socket.on("connectingToRoom", roomName => {
          readableSession =
            socket.request.session &&
            JSON.parse(socket.request.session.session);
          myCurrentRoom = roomName;
          user.room = roomName;
          socket.join(myCurrentRoom);
        });

        socket.on("message", ({ message, myUser }) => {
          saveMessage(
            {
              message,
              picture: user.picture,
              name: user.name || user.accountName,
              time: new Date().toLocaleTimeString(),
              date: new Date().toLocaleDateString()
            },
            myCurrentRoom
          );
          io.in(myCurrentRoom).emit("message", {
            id: id++,
            message: message,
            picture: user.picture,
            name: user.name || user.accountName,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString()
          });
        });

        socket.on("exit", () => {
          user.room = "";
          myCurrentRoom = "";
        });
      }
    },
    socketPersistance(socket, next) {
      const parseCookie = cookieParser(sessionSecret);
      let handshake = socket.request;
      parseCookie(handshake, null, function(err, data) {
        sessionService.get(handshake, next, db);
      });
    }
  };
};
