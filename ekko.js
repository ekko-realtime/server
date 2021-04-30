require("dotenv").config();
const app = require("express")();
const server = require("http").Server(app);
const cors = require("cors");
const socketio = require("socket.io");
const redis = require("socket.io-redis");
const express = require("express");

const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_ENDPOINT || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const io = socketio(server, { cors: { origin: "*" } });
io.adapter(redis({ host: redisHost, port: redisPort }));
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
  socket.on("update", (associations) => {
    console.log("socket received update");
    associationsMgr.handleUpdateAssociations(associations);
  });
});

io.on("update", (associations) => {
  console.log("received update");
  associationsMgr.handleUpdateAssociations(associations);
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

// TODO: !!! CAN ADD IF WE WANT TO BE ABLE TO SEE THAT SERVER IS RUNNING
app.get("/", (req, res) => {
  res.send("ekko-server"); // TODO: Should this endpoint render anything?
});

app.post("/associations", (req, res) => {
  //send req.body to associations manager
  //decrypt
  console.log("request ", req.body);
  const updatedAssociations = handleAssociationsDecoding(req.body.token);

  if (updatedAssociations) {
    res.sendStatus(200);
    io.of("balloon").emit("update", updatedAssociations);
  } else {
    res.status(400).send("Invalid JWT");
  }
});
