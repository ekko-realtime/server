class LoggingMgr {
  constructor({ io }) {
    this.io = io;
    //console.log("LoggingMgr", this.io);
  }

  logEvent(params) {
    const payload = this.generateEventPayload(params);

    this.sendStatus(payload);
    console.log(payload);
  }

  generateEventPayload({ socket, eventName }) {
    return {
      uuid: socket.uuid,
      admin: socket.admin,
      app: socket.appName,
      event: eventName,
    };
  }

  sendStatus(payload) {
    // TODO: Do we want status payload to be on the message property, or should we have a different prop name?
    this.io.of(payload.app).to("admin").emit("status", { message: payload });
  }

  sendPresenceEvents(eventType, socket, channel) {
    let action = eventType == "subscribe" ? "JOINED" : "LEFT";

    let payload = {
      message: {
        content: `has ${action} ${channel} channel.`,
      },
      uuid: socket.uuid,
    };

    this.io
      .of(socket.appName)
      .to(this.presenceChannel(channel))
      .emit("presence", payload); //send to just presence channel
    this.logEvent({ socket, eventName: `${action} "${channel}" channel` });
  }

  presenceChannel(channel) {
    return `${channel}_presence`;
  }
}

module.exports = LoggingMgr;
