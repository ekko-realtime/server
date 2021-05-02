require("dotenv").config();
const app = require("express")();
const server = require("http").Server(app);
const cors = require("cors");
const socketio = require("socket.io");
const socketioRedis = require("socket.io-redis");
const redis = require("redis");
const express = require("express");

const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_ENDPOINT || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const io = socketio(server, { cors: { origin: "*" } });
io.adapter(socketioRedis({ host: redisHost, port: redisPort }));
const ekkoApps = io.of(/.*/);

// Managers2
const LoggingMgr = require("./lib/loggingMgr");
const AssociationMgr = require("./lib/associationsMgr");
const LambdaMgr = require("./lib/lambdaMgr");
const loggingMgr = new LoggingMgr({ io });
const associationsMgr = new AssociationMgr({
  loggingMgr,
  io,
});
const lambdaMgr = new LambdaMgr({ loggingMgr, associationsMgr, io });

// Handlers
const {
  handleAuthorization,
  handleAddParamsToSocket,
  handleAssociationsDecoding,
} = require("./bin/authorizing");

const { handleConnect, handleDisconnect } = require("./bin/connecting")(
  loggingMgr,
  io
);

const {
  handleSubscribe,
  handleUnsubscribe,
  handleAdminSubscribe,
} = require("./bin/subscribing")(loggingMgr, io);

const { handlePublish } = require("./bin/publishing")(
  lambdaMgr,
  io,
  loggingMgr
);

// Middleware
app.use(cors());
ekkoApps.use(handleAuthorization);
ekkoApps.use(handleAddParamsToSocket);
app.use(express.json());

// Handle connected socket events
ekkoApps.on("connection", (socket) => {
  loggingMgr.logEvent({ socket, eventName: "connection" });
  handleConnect(socket);
  handleAdminSubscribe(socket);
  socket.on("disconnect", () => handleDisconnect(socket));
  socket.on("subscribe", (params) => handleSubscribe(socket, params));
  socket.on("unsubscribe", (params) => handleUnsubscribe(socket, params));
  socket.on("publish", (params) => handlePublish(socket, params));
});

// Update Associations
const redisSubscriber = redis.createClient(redisPort, redisHost);
const redisPublisher = redis.createClient(redisPort, redisHost);
redisSubscriber.subscribe("ekko-associations");
redisSubscriber.on("message", (channel, stringData) => {
  // UPDATE IN MEMORY ASSOCIATION STUFF
  console.log(channel, stringData);
  loggingMgr.logMessage("received redis update for ekko server");
  associationsMgr.updateData(stringData);
});

// TODO: !!! CAN ADD IF WE WANT TO BE ABLE TO SEE THAT SERVER IS RUNNING
app.get("/", (req, res) => {
  res.send("ekko-server"); // TODO: Should this endpoint render anything?
});

app.put("/associations", (req, res) => {
  const updatedAssociations = handleAssociationsDecoding(req.body.token);
  loggingMgr.logMessage("received put request");
  if (updatedAssociations) {
    // console.log(updatedAssociations);
    redisPublisher.publish("ekko-associations", updatedAssociations);
    loggingMgr.logMessage("received updated jwt from CLI");
    res.sendStatus(200);
  } else {
    res.status(400).send("Invalid JWT");
  }
  res.end();
});

server.listen(port, () => {
  const message = `Server: ekko server started on port ${port}`;
  const line = new Array(message.length).fill("-").join("");
  console.log(`${line}\n${message}\n${line}`);
});

// TODO: !!! CAN GO INTO ekkoApps.on("connection") IF WE ADD FUNCTIONALITY TO CLIENT
//   socket.on("unsubscribeAll", () => {
//     unsubscribeToChannels(socket, socket.rooms);
//   });

//   socket.on("getAllConnections", async ({ channel }) => {
//     let activeSockets = await io.of("/").adapter.sockets(new Set());
//     console.log("getAllConnections: ", activeSockets);
//   });
//   socket.on("getAllActiveChannels", async ({ channel }) => {
//     let rooms = await io.of("/").adapter.allRooms();
//     console.log("getAllActiveChannels: ", rooms);
//   });
//   socket.on("getAllSocketsInChannel", async ({ channel }) => {
//     let activeSockets = await io.in(channel).allSockets();
//     console.log("getAllSocketsInChannel: ", activeSockets);
//   });
