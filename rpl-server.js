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

  socket.onAny((eventName, ...args) => {
    let message = args[0];
    socket.emit(eventName, message);
  });
});

http.listen(port, () => {
  console.log(`Server started on port ${port}. press Ctrl + C to terminate`);
});
