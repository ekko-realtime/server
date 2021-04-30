module.exports = (io) => {
  const logEvent = (params) => {
    const payload = generateEventPayload(params);

    sendStatus(payload);
    console.log(payload);
  };

  // PRIVATE

  const generateEventPayload = ({ socket, eventName }) => {
    return {
      uuid: socket.uuid,
      admin: socket.admin,
      app: socket.appName,
      event: eventName,
    };
  };

  const sendStatus = (payload) => {
    // TODO: Do we want status payload to be on the message property, or should we have a different prop name?
    io.of(payload.app).to("admin").emit("status", { message: payload });
  };

  const sendPresenceEvents = (eventType, socket, channel) => {
    let action = eventType == "subscribe" ? "JOINED" : "LEFT";
  
    let payload = {
      message: {
        content: `has ${action} ${channel} channel.`,
      },
      uuid: socket.uuid, 
    };
    
    io.of(socket.appName).to(presenceChannel(channel)).emit("presence", payload); //send to just presence channel
    logEvent({ socket, eventName: `${action} "${channel}" channel` });
  };

  const presenceChannel = (channel) => {
    return `${channel}_presence`;
  };
  
  return { logEvent, sendPresenceEvents };
};

