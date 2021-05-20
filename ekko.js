require("dotenv").config();
const DEV = "development";
const PROD = "production";
const TEST = "testing";

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
if (process.env.NODE_ENV !== DEV) {
  io.adapter(socketioRedis({ host: redisHost, port: redisPort }));
}

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

const { handleConnect, handleDisconnect } =
  require("./bin/connecting")(loggingMgr);

const { handleSubscribe, handleUnsubscribe, handleAdminSubscribe } =
  require("./bin/subscribing")(loggingMgr, io);

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
  handleConnect(socket);
  handleAdminSubscribe(socket);
  socket.on("disconnect", () => handleDisconnect(socket));
  socket.on("subscribe", (params) => handleSubscribe(socket, params));
  socket.on("unsubscribe", (params) => handleUnsubscribe(socket, params));
  socket.on("publish", (params) => handlePublish(socket, params));
});

// Set up ekko server as redis publisher and subscriber
// to both send and receive updated associations data
let redisSubscriber, redisPublisher;

if (process.env.NODE_ENV !== DEV) {
  redisSubscriber = redis.createClient(redisPort, redisHost);
  redisPublisher = redis.createClient(redisPort, redisHost);

  redisSubscriber.subscribe("ekko-associations");
  redisSubscriber.on("message", (channel, updatedAssociations) => {
    associationsMgr.handleUpdateAssociations(updatedAssociations);
  });
}

//server response for GET request of endpoint
app.get("/", (req, res) => {
  res.send("ekko-server");
});

//Ekko CLI sends JWT for new associations data
//publish to "ekko-associations" so all server nodes receive updated data
app.put("/associations", (req, res) => {
  const updatedAssociations = handleAssociationsDecoding(req.body.token);

  if (updatedAssociations) {
    if (process.env.NODE_ENV !== DEV) {
      redisPublisher.publish("ekko-associations", updatedAssociations);
    } else {
      associationsMgr.handleUpdateAssociations(updatedAssociations);
    }

    res.sendStatus(200);
  } else {
    res.status(400).send("Invalid JWT");
  }

  res.end();
});

server.listen(port, () => {
  const message = `Server: ekko server started on port ${port}`;
  const line = new Array(message.length).fill("-").join("");
  console.log(message, `\n`, line);
});
