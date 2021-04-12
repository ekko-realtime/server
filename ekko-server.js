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
      // TODO add status update functionality
      console.log(`Server: User subscribed to ${channel}`);
      io.to(channel).emit("info", `Server: User subscribed to ${channel}`);
    });
  });

  socket.on("unsubscribe", (channel) => {
    socket.leave(channel);
    console.log(`Server: User unsubscribed from ${channel}`);
  });

  // Wrapper around socket.io's emit functionality that requires the client to provide a channel
  socket.on("publish", async ({ channel, message }) => {
    const { type, content } = message;

    // switch (type) {
    //   case "text":
    //     break;
    //   //TODO ADD IN OTHER TYPES (INTEGER, ARRAY, ETC)
    //   default:
    //   // code block
    // }

    let responseMessage = content;
    console.log("response message", responseMessage);

    if (Lambdas.hasLambda(channel)) {
      console.log("has lambda");
      console.log(content);
      responseMessage = await Lambdas.callLambda({ channel, content });
    }

    io.to(channel).emit("thought", responseMessage);
  });
});

http.listen(port, () => {
  const message = `Server: ekko server started on port ${port}`;
  const line = new Array(message.length).fill("-").join("");
  console.log(`${line}\n${message}\n${line}`);
});
