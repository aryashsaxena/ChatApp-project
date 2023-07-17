const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectToMongo = require("./config/db");
const app = express();
const { chats } = require("./database/data");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./router/userRoutes");
const chatRoutes = require("./router/chatRoutes");
const messageRoutes = require("./router/messageRoutes");
const colors = require("colors");
dotenv.config();
connectToMongo();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("api is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chathub-b6lgxuugh-aryashsaxena.vercel.app/",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io".blue);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    // console.log(newMessageRecieved,'newMessageRecieved');
    // console.log(chat,'chat');
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });
});
