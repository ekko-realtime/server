module.exports = (loggingMgr) => {
  console.log("connecting received loggingMgr", loggingMgr);

  const handleConnect = (socket) => {
    loggingMgr.logEvent({ socket, eventName: "CONNECTED to ekko server" });
  };

  const handleDisconnect = (socket) => {
    socketDisconnect(socket);
    loggingMgr.logEvent({ socket, eventName: "DISCONNECTED from ekko server" });
  };

  // PRIVATE

  const socketDisconnect = (socket) => {
    // console.log("SOCKET", socket.rooms);
    // TODO: This seems to always return a set(0)
    socket.rooms.forEach((channel) => {
      loggingMgr.logEvent({ socket, eventName: `LEFT "${channel}" channel` });
    });
  };

  return { handleConnect, handleDisconnect };
};
