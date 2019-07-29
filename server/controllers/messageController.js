const Room = require("../collections/rooms");

module.exports = {
  roomJoin: (req, res, next) => {
    const { room } = req.query;

    Room.find({ room }).then(foundRoom => {
      if (!foundRoom.length) {
        const myRoom = new Room({
          room,
          chatHistory: []
        });

        myRoom.save(err => {
          req.session.user.room = room;
          res.status(200).send(req.session.user.room);
        });
      } else {
        req.session.user.room = room;
        res.status(200).send(req.session.user.room);
      }
    });
  },
  exitRoom: (req, res, next) => {
    req.session.user.room = "";
    res.status(200).send("");
  },
  saveMessage(userMessage, roomName) {
    Room.find({ room: roomName }).then(([foundRoom]) => {
      const { name, message, time, picture, date } = userMessage;

      foundRoom.chatHistory.push({ name, message, time, picture, date });

      foundRoom.save(err => {
        if (err) {
          console.log(err);
        }
        return userMessage;
      });
    });
  },
  grabAllMessages(req, res, next) {
    const { room } = req.query;
    Room.find({ room }).then(([foundRoom]) => {
      if (foundRoom) {
        console.log("foundRoom: ", foundRoom);
        res.status(200).send(foundRoom.chatHistory);
      } else {
        res.status(200).send([]);
      }
    });
  },
  grabAllRooms(req, res, next) {
    Room.find()
      .select(["room"])
      .then(foundRooms => {
        res.status(200).send(foundRooms);
      });
  }
};
