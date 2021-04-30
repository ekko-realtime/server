module.exports = (loggingMgr) => {
  const sendPresenceEvents = loggingMgr.sendPresenceEvents;

  const handleSubscribe = (socket, params) => {
    subscribeToChannels(socket, params);
  };

  const handleUnsubscribe = (socket, params) => {
    unsubscribeFromChannels(socket, params);
  };

  const handleAdminSubscribe = (socket) => {
    if (socket.admin) {
      handleSubscribe(socket, { channels: ["admin"] });
    }
  };

  // PRIVATE

  const subscribeToChannels = (socket, params) => {
    let { channels, withPresence } = params;

    channels.forEach((channel) => {
      if (channel !== "admin" || socket.admin) {
        socket.join(channel);
        if (withPresence) {
          socket.join(presenceChannel(channel));
          sendPresenceEvents("subscribe", socket, channel);
        }
      }
    });
  };

  const unsubscribeFromChannels = (socket, { channels }) => {
    channels.forEach((channel) => {
      unsubscribeFromChannel(socket, channel);
      sendPresenceEvents("unsubscribe", socket, channel);
    });
  };

  const unsubscribeFromChannel = (socket, channel) => {
    socket.leave(channel);
    socket.leave(presenceChannel(channel));
  };

  const presenceChannel = (channel) => {
    return `${channel}_presence`;
  };

  return { handleSubscribe, handleUnsubscribe, handleAdminSubscribe };
};
