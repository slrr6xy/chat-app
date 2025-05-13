const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const PORT = 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  // ルーム作成
  socket.on("createRoom", ({ room, password }, callback) => {
    if (rooms[room]) {
      return callback({
        success: false,
        message: "すでに存在するルーム名です",
      });
    }

    rooms[room] = { password };
    socket.join(room);
    callback({ success: true });
  });

  // ルーム入室
  socket.on("joinRoom", ({ room, password }, callback) => {
    const roomData = rooms[room];

    if (!roomData) {
      return callback({ success: false, message: "そのルームは存在しません" });
    }

    if (roomData.password && roomData.password !== password) {
      return callback({
        success: false,
        message: "パスワードが間違っています",
      });
    }

    socket.join(room);
    callback({ success: true });
  });

  // 退出
  socket.on("leaveRoom", ({ room }) => {
    socket.leave(room);
  });

  // チャットメッセージ
  socket.on("chatMessage", (msg) => {
    const room = [...socket.rooms][1];
    if (room) {
      io.to(room).emit("chatMessage", msg);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
