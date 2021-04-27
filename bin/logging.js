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

  return { logEvent };
};

// const sendConnectionEvents = (eventType, socket, channel) => {
//   let action = eventType == "subscribe" ? "joined" : "left";

//   let payload = {
//     message: {
//       content: `has ${action} ${channel} channel.`,
//     },
//     uuid: socket.nickname, // THIS IS NOW ALWAYS ON THE SOCKET
//   };
//   console.log("sendConnectionEvent ", payload.message.content);

//   io.of(socket.appName).to(presenceChannel(channel)).emit("presence", payload); //send to just presence channel
//   io.of(socket.appName).to("admin").emit("status", payload); //send status event
// };
