class LoggingMgr {
  constructor({ io }) {
    this.io = io;
  }

  logEvent(params) {
    const payload = this.generateEventPayload(params);
    this.sendStatus(payload);
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
    this.io.of(payload.app).to("admin").emit("status", payload);
  }

  sendPresenceEvents({ eventName, socket, channel, presenceChannel }) {
    let payload = {
      eventName,
      channel,
      presenceChannel,
      uuid: socket.uuid,
    };

    this.io.of(socket.appName).to(presenceChannel).emit("presence", payload);
    this.logEvent({ socket, ...payload });
  }
}

module.exports = LoggingMgr;
