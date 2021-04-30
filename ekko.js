require("dotenv").config();
const app = require("express")();
const server = require("http").Server(app);
const cors = require("cors");
const socketio = require("socket.io");
const redis = require("socket.io-redis");

const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_ENDPOINT || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const io = socketio(server, { cors: { origin: "*" } });
io.adapter(redis({ host: redisHost, port: redisPort }));
const ekkoApps = io.of(/.*/);

// Handlers
const authorizing = require("./bin/authorizing");
const connecting = require("./bin/connecting")(io);
const subscribing = require("./bin/subscribing")(io);
const publishing = require("./bin/publishing")(io);
const { handleAuthorization, handleAddParamsToSocket } = authorizing;
const { handleConnect, handleDisconnect } = connecting;
const { handleSubscribe, handleUnsubscribe } = subscribing;
const { handlePublish } = publishing;

// Middleware
app.use(cors());
ekkoApps.use(handleAuthorization);
ekkoApps.use(handleAddParamsToSocket);

// Handle connected socket events
ekkoApps.on("connection", (socket) => {
  console.log("connection");
  handleConnect(socket);
  socket.on("disconnect", () => handleDisconnect(socket));
  socket.on("subscribe", (params) => handleSubscribe(socket, params));
  socket.on("unsubscribe", (params) => handleUnsubscribe(socket, params));
  socket.on("publish", (params) => handlePublish(socket, params));
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
