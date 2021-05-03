module.exports = (loggingMgr, io) => {
  const handleConnect = (socket) => {
    loggingMgr.logEvent({ socket, eventName: "connection" });
    // handleGetAllConnections({ appName: "app_1" });
    // handleGetAllActiveChannels({ appName: "app_1" });
    // handleGetAllSocketsInChannel({ appName: "app_1", channel: "channel_2" });
  };

  const handleDisconnect = (socket) => {
    socketDisconnect(socket);
  };

  const handleGetAllConnections = async ({ appName }) => {
    let activeSockets = await io.of(`/${appName}`).adapter.sockets(new Set());
    loggingMgr.sendStatus({ app: appName, activeSockets });
    console.log("getAllConnections: ", activeSockets);
  };

  const handleGetAllActiveChannels = async ({ appName }) => {
    let activeChannels = await io.of(`/${appName}`).adapter.allRooms();
    loggingMgr.sendStatus({ app: appName, activeChannels });
    console.log("getAllActiveChannels: ", activeChannels);
  };

  const handleGetAllSocketsInChannel = async ({ appName, channel }) => {
    let activeSockets = await io.of(`/${appName}`).in(channel).allSockets();
    loggingMgr.sendStatus({ app: appName, activeSockets });
    console.log("getAllSocketsInChannel: ", activeSockets);
  };

  // PRIVATE

  //disconnect from all channels
  const socketDisconnect = (socket) => {
    socket.ekkoChannels.forEach(({ channel, presenceChannel }) => {
      if (presenceChannel) {
        loggingMgr.sendPresenceEvents({
          eventType: "left",
          channel,
          presenceChannel,
          socket,
        });
      }
    });
  };

  return {
    handleConnect,
    handleDisconnect,
    handleGetAllConnections,
    handleGetAllActiveChannels,
    handleGetAllSocketsInChannel,
  };
};
