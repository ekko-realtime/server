module.exports = (loggingMgr) => {
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
  //subscribe to a list of channels passed in as params
  const subscribeToChannels = (socket, params) => {
    let { channels, withPresence } = params;

    socket.ekkoChannels = socket.ekkoChannels || [];

    channels.forEach((channel) => {
      if (channel !== "admin" || socket.admin) {
        subscribeToChannel(socket, channel, withPresence);
      }
    });
  };

  //unsubscribe from channels passed in as params
  const unsubscribeFromChannels = (socket, { channels }) => {
    channels.forEach((channel) => {
      unsubscribeFromChannel(socket, channel);
      loggingMgr.sendPresenceEvents(
        "unsubscribe",
        socket,
        presenceChannel(channel)
      );
    });
  };

  //parameters for sending presence events
  const presenceParams = (socket, eventName, channelObj) => {
    let { channel, presenceChannel } = channelObj;
    return {
      eventName,
      socket,
      channel,
      presenceChannel,
    };
  };

  //subscribe to a specific channel
  const subscribeToChannel = (socket, channel, withPresence) => {
    socket.join(channel);

    let ekkoChannel = { channel };

    //join the presence channel
    if (withPresence) {
      ekkoChannel.presenceChannel = presenceChannel(channel);
      socket.join(ekkoChannel.presenceChannel);
      let params = presenceParams(socket, "joined", ekkoChannel);
      loggingMgr.sendPresenceEvents(params);
    }

    socket.ekkoChannels.push(ekkoChannel);
  };

  //unsubscribe from specific channel
  const unsubscribeFromChannel = (socket, channel) => {
    socket.leave(channel);

    let ekkoChannel = socket.ekkoChannels.find((channelObj) => {
      return channelObj.channel === channel;
    });
    let { presenceChannel } = ekkoChannel;

    //leave presence channel
    if (presenceChannel) {
      socket.leave(presenceChannel);
      let params = presenceParams(socket, "left", ekkoChannel);
      loggingMgr.sendPresenceEvents(params);
    }

    socket.ekkoChannels = socket.ekkoChannels.filter((channelObj) => {
      return channelObj !== ekkoChannel;
    });
  };

  const presenceChannel = (channel) => {
    return `${channel}_presence`;
  };

  return { handleSubscribe, handleUnsubscribe, handleAdminSubscribe };
};
