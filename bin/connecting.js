module.exports = (io) => {
  const { logEvent } = require("./logging")(io);
  const { handleSubscribe } = require("./subscribing")(io);

  const handleConnect = (socket) => {
    logEvent({ socket, eventName: "CONNECTED to ekko server" });

    if (socket.admin) {
      handleSubscribe(socket, { channels: ["admin"] });
    }
  };

  const handleDisconnect = (socket) => {
    socketDisconnect(socket);
    logEvent({ socket, eventName: "DISCONNECTED from ekko server" });
  };

  // PRIVATE

  const socketDisconnect = (socket) => {
    console.log("SOCKET", socket.rooms);
    // TODO: This seems to always return a set(0)
    socket.rooms.forEach((channel) => {
      logEvent({ socket, eventName: `LEFT "${channel}" channel` });
    });
  };

  return { handleConnect, handleDisconnect };
};
