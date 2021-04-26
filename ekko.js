require("dotenv").config();
const app = require("express")();
const server = require("http").Server(app);
const cors = require("cors");
const socketio = require("socket.io");
const redis = require("socket.io-redis");
const Lambdas = require("./lib/lambdas/lambdas.js");
const { isValid, addParamsToSocket } = require("./lib/authorization");

const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_ENDPOINT;
const redisPort = process.env.REDIS_PORT;

app.use(cors());
const io = socketio(server, { cors: { origin: "*" } }); // TODO: Is this the best way to handle all origins?
io.adapter(redis({ host: redisHost, port: redisPort }));
const ekkoApps = io.of(/.*/);

// Handle authorization
ekkoApps.use(async (socket, next) => {
  if (await isValid(socket)) {
    next();
  } else {
    next(new Error("Authorization error"));
  }
});

// Add params to socket
ekkoApps.use(async (socket, next) => {
  await addParamsToSocket(socket);
  next();
});

ekkoApps.on("connection", (socket) => {
  console.log("Server: User connected");

  if (socket.admin) {
    subscribeToChannels(socket, { channels: ["admin"] });
  }

  socket.on("disconnect", () => {
    console.log("Server: User disconnected");
    socketDisconnect(socket);
  });

  socket.on("subscribe", (params) => {
    subscribeToChannels(socket, params);
  });

  socket.on("unsubscribeAll", () => {
    unsubscribeToChannels(socket, socket.rooms);
  });

  socket.on("unsubscribe", (params) => {
    unsubscribeToChannels(socket, params);
  });

  socket.on("publish", (params) => {
    publish(socket.appName, params);
  });

  socket.on("getAllConnections", async ({ channel }) => {
    let activeSockets = await io.of("/").adapter.sockets(new Set());
    console.log("getAllConnections: ", activeSockets);
  });

  socket.on("getAllActiveChannels", async ({ channel }) => {
    let rooms = await io.of("/").adapter.allRooms();
    console.log("getAllActiveChannels: ", rooms);
  });

  socket.on("getAllSocketsInChannel", async ({ channel }) => {
    let activeSockets = await io.in(channel).allSockets();
    console.log("getAllSocketsInChannel: ", activeSockets);
  });
});

const subscribeToChannels = (socket, data) => {
  let { channels, presenceEvents, publisher } = data;
  socket.nickname = publisher || "user";

  channels.forEach((channel) => {
    if (channel !== "admin" || socket.admin) {
      socket.join(channel);
    }

    // TODO add status update functionality (for dev backend server)
    if (presenceEvents) {
      socket.join(presenceChannel(channel));
    }
    sendConnectionEvents("subscribe", socket, channel);
  });
};

const presenceChannel = (channel) => {
  return `${channel}_presence`;
};

const sendConnectionEvents = (eventType, socket, channel) => {
  let action = eventType == "subscribe" ? "joined" : "left";

  let payload = {
    message: {
      content: `has ${action} ${channel} channel.`,
    },
    uuid: socket.nickname,
  };
  console.log("sendConnectionEvent ", payload.message.content);

  io.of(socket.appName).to(presenceChannel(channel)).emit("presence", payload); //send to just presence channel
  io.of(socket.appName).to("admin").emit("status", payload); //send status event
};

const socketDisconnect = (socket) => {
  socket.rooms.forEach((channel) => {
    io.of(socket.appName)
      .to("admin")
      .emit("status", {
        message: { content: `${socket.nickname} has disconnected.` },
      });
  });
};

const unsubscribeToChannels = (socket, { channels }) => {
  console.log("unsubscribe to channels");
  channels.forEach((channel) => {
    unsubscribeToChannel(socket, channel);
    sendConnectionEvents("unsubscribe", socket, channel);
  });
};

const unsubscribeToChannel = (socket, channel) => {
  socket.leave(channel);
  socket.leave(presenceChannel(channel));
};

const publish = async (appName, params) => {
  let payload = { ...params };
  let { app, channel, message } = params;
  app = "app_1"; //for testing, remove for production
  const matchingLambdas = Lambdas.getMatchingLambdas(app, channel);
  console.log("matchingLambdas ", matchingLambdas);

  if (matchingLambdas) {
    let response = await Lambdas.processMessage({
      channel,
      message,
      lambdas: matchingLambdas,
    });
    payload.message = response.message;
  }

  io.of(appName).to(channel).emit("message", payload);
};

app.get("/", (req, res) => {
  res.send("ekko-server"); // TODO: Should this endpoint render anything?
});

server.listen(port, () => {
  const message = `Server: ekko server started on port ${port}`;
  const line = new Array(message.length).fill("-").join("");
  console.log(`${line}\n${message}\n${line}`);
});
