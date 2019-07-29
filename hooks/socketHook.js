import { useState, useEffect } from "react";
import axios from "axios";
export default function MessageHook(socket) {
  let [message, setMessage] = useState([]);
  let [roomName, setRoom] = useState("");
  let [user, setUser] = useState({});

  function messageHandler(recievedMessage) {
    setMessage([...message, recievedMessage]);
  }

  function roomHandler(roomName) {
    setRoom(roomName);
  }

  function exitRoom() {
    axios
      .get("/api/exit_room")
      .then(res => {
        socket.emit("exit");
        setMessage([]);
        setRoom("");
      })
      .catch(err => console.log(err));
  }

  function sendMessage(messageToSend) {
    socket.emit("message", messageToSend);
  }

  function joinRoom(room) {
    axios
      .get(`/api/joinroom?room=${room}`)
      .then(res => {
        console.log("hit returned", res.data);
        setRoom(res.data);
        socket.emit("connectingToRoom", res.data);
      })
      .catch(err => console.log("hjkh", err));
  }

  useEffect(() => {
    socket.on("message", messageHandler);
    return () => socket.removeListener("message", messageHandler);
    // messageHandler in the dependency array will cause a rerender everytime
    // eslint-disable-next-line
  }, [socket, message]);

  // useEffect(() => {
  //   socket.on("exit", exitHandler);
  //   return () => socket.removeListener("exit", exitHandler);
  // }, [socket]);

  useEffect(() => {
    socket.on("connectedToRoom", roomHandler);
    return () => socket.removeListener("connectedToRoom", roomHandler);
    // roomHandler in the dependency array will cause a rerender everytime
    // eslint-disable-next-line
  }, [socket, roomName]);

  useEffect(() => {
    axios
      .get("/api/user_info")
      .then(res => {
        setUser(res.data);
        setRoom(res.data.room);
      })
      .catch(err => console.log(err));
  }, []);

  return { message, sendMessage, joinRoom, roomName, setMessage, exitRoom };
}
