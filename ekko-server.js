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
const Lambdas = require("./lambdas.js");

app.get("/", (req, res) => {
  res.send("ekko-server");
});

io.on("connection", (socket) => {
  console.log("Server: User connected");

  socket.on("disconnect", () => {
    console.log("Server: User disconnected");
  });

  socket.on("subscribe", ({ channels }) => {
    channels.forEach((channel) => {
      socket.join(channel);
      // TODO add status update functionality (for dev backend server)
      console.log(`Server: User subscribed to ${channel}`);
      io.to(channel).emit("info", `Server: User subscribed to ${channel}`);
    });
  });

  socket.on("unsubscribe", ({ channels }) => {
    channels.forEach((channel) => {
      socket.leave(channel);
      // TODO add status update functionality (for dev backend server)
      io.to(channel).emit("info", `Server: User unsubscribed from ${channel}`);
    });
  });

  // TODO: decide if publish is message specific or if we should have access to another paramter for presence/status/etc.
  socket.on("publish", async (params) => {
    let payload = { ...params };

    if (Lambdas.hasLambda(params.channel)) {
      payload.message = await Lambdas.callLambda({
        channel: params.channel,
        message: params.message,
      });
    }

    io.to(params.channel).emit("message", payload);
  });
});

http.listen(port, () => {
  const message = `Server: ekko server started on port ${port}`;
  const line = new Array(message.length).fill("-").join("");
  console.log(`${line}\n${message}\n${line}`);
});
