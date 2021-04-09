const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("rpl-server");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });

  socket.on("subscribe", (channel) => {
    console.log("subscribed to ", channel);
    socket.join(channel);
    io.to(channel).emit("thought","Hey Baby!");
  });

  socket.on("unsubscribe", (channel) => {
    socket.leave(channel);
  });

  socket.onAny((eventName, ...args) => {
    console.log("onAny ", eventName);
    let message = args[0];
    io.to("balloon").emit(eventName, message);
  });
});

http.listen(port, () => {
  console.log(`Server started on port ${port}. press Ctrl + C to terminate`);
});
