if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// libraries
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const moment = require("moment");

// constants
const port = process.env.PORT || 4001;
const allowedOriginURL = process.env.NODE_ENV !== 'production' ? "http://localhost:3000" : process.env.FRONTEND_URL;
const app = express();
const index = require("./routes/index");

// middleware 
app.use(index);
// proxy to add header to stop cors errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// initialize app
const server = http.createServer(app);
const io = socketIo(server, { // websocket CORS
  cors: {
    origin: allowedOriginURL,
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
// process.env.NODE_ENV === "production" ? "https://nextjs-nodejs-chatroom.netlify.app/" : "http://localhost:3000",

let users = [];
io.on("connection", (socket) => {

  socket.on("login", (userName) => {
    users.push({ id: socket.id, userName: userName, connectionTime: new moment().format("YYYY-MM-DD HH:mm:ss") });
    socket.emit("connecteduser", JSON.stringify(users[users.length - 1]));
    io.emit("users", JSON.stringify(users));
  });

  socket.on("sendMsg", msgTo => {
    msgTo = JSON.parse(msgTo);
    const minutes = new Date().getMinutes();
    io.emit("getMsg",
      JSON.stringify({
        id: socket.id,
        userName: users.find(e => e.id == msgTo.id).userName,
        msg: msgTo.msg,
        time: new Date().getHours() + ":" + (minutes < 10 ? "0" + minutes : minutes)
      }));
  });

  socket.once("disconnect", () => {
    let index = -1;
    if (users.length >= 0) {
      index = users.findIndex(e => e.id == socket.id);
    }
    if (index >= 0)
      users.splice(index, 1);
    io.emit("users", JSON.stringify(users));
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));