module.exports = (loggingMgr) => {
  const handleConnect = (socket) => {
    loggingMgr.logEvent({ socket, eventName: "connection" });
  };

  const handleDisconnect = (socket) => {
    socketDisconnect(socket);
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

  return { handleConnect, handleDisconnect };
};
