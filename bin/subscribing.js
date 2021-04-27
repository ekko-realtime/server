module.exports = (io) => {
  const { logEvent } = require("./logging")(io);

  const handleSubscribe = (socket, params) => {
    subscribeToChannels(socket, params);
  };

  const handleUnsubscribe = (socket, params) => {
    unsubscribeFromChannels(socket, params);
  };

  // PRIVATE

  const subscribeToChannels = (socket, data) => {
    let { channels, presenceEvents } = data;

    channels.forEach((channel) => {
      if (channel !== "admin" || socket.admin) {
        socket.join(channel);
      }

      logEvent({ socket, eventName: `JOINED "${channel}" channel` });
    });
  };

  const unsubscribeFromChannels = (socket, { channels }) => {
    console.log("unsubscribe to channels");
    channels.forEach((channel) => {
      unsubscribeFromChannel(socket, channel);
      sendConnectionEvents("unsubscribe", socket, channel);
    });
  };

  const unsubscribeFromChannel = (socket, channel) => {
    socket.leave(channel);
    socket.leave(presenceChannel(channel));
  };

  return { handleSubscribe, handleUnsubscribe };
};

// TODO: !!! ADD TO subscribeToChannels IF WE UPDATE FUNCTIONALITY TO INCLUDE PRESENCE
// if (presenceEvents) {
//   socket.join(presenceChannel(channel));
// }
