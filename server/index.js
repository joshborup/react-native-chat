require("dotenv").config();
const { CONNECTION_STRING, SESSION_SECRET } = process.env;
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const session = require("express-session");
const io = require("socket.io")(server);
const {
  roomJoin,
  exitRoom,
  grabAllMessages,
  grabAllRooms
} = require("./controllers/messageController");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const {
  mySocketFunc,
  socketPersistance
} = require("./controllers/socketController")(
  io,
  SESSION_SECRET,
  CONNECTION_STRING
);
const { auth, userInfo, logout } = require("./controllers/authController");
app.use(express.json());
app.use(express.static(__dirname + "/../build"));
app.use(
  session({
    store: new MongoStore({ url: CONNECTION_STRING }),
    secret: SESSION_SECRET,
    resave: true,
    key: "express.sid",
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

require("dotenv").config();
let db;

mongoose
  .connect(CONNECTION_STRING, { useNewUrlParser: true, useCreateIndex: true })
  .then(databaseInstance => {
    db = databaseInstance;
  });

io.use(socketPersistance);
app.get("/api/joinroom", roomJoin);
app.get("/api/exit_room", exitRoom);
app.get("/api/get_room_messages", grabAllMessages);
app.get("/api/get_available_rooms", grabAllRooms);

app.get("/api/auth", auth);

app.get("/api/user_info", userInfo);

app.post("/api/logout", logout);

io.sockets.on("connection", mySocketFunc);

const path = require("path");
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build/index.html"));
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
