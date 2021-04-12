const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5000",
    // TODO: Look into what the "GET" and "POST" are doing
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("ekko-server");
});

io.on("connection", (socket) => {
  console.log("Server: User connected");

  socket.on("disconnect", () => {
    console.log("Server: User disconnected");
  });

  socket.on("subscribe", (channel) => {
    socket.join(channel);
    console.log(`Server: User subscribed to ${channel}`);
    io.to(channel).emit("info", `Server: User subscribed to ${channel}`);
  });

  socket.on("unsubscribe", (channel) => {
    socket.leave(channel);
    console.log(`Server: User unsubscribed from ${channel}`);
  });

  // Wrapper around socket.io's emit functionality that requires the client to provide a channel
  socket.on("publish", ({ channel, eventType, data }) => {
    io.to(channel).emit(eventType, data);
  });
});

http.listen(port, () => {
  const message = `Server: ekko server started on port ${port}`;
  const line = new Array(message.length).fill("-").join("");
  console.log(`${line}\n${message}\n${line}`);
});
