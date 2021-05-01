module.exports = (lambdaMgr, io, loggingMgr) => {
  const handlePublish = (socket, params) => {
    publish(socket, params);
  };

  // PRIVATE

  const publish = async (socket, params) => {
    let payload = { ...params };
    let { appName } = socket;
    let { channel, message } = params;

    const matchingLambdas = lambdaMgr.getMatchingLambdas(appName, channel);
    loggingMgr.logEvent({
      socket,
      eventName: `matching_lambdas: ${matchingLambdas}`,
    });

    if (matchingLambdas) {
      let updatedMessage = await lambdaMgr.processMessage({
        channel,
        message,
        lambdas: matchingLambdas,
      });

      console.log("updatedMessage ", updatedMessage);
      if (!updatedMessage) {
        loggingMgr.logEvent({
          socket,
          eventName: `nothing returned from lambdas`,
        });
      } else {
        payload.message = updatedMessage;
      }
    }

    io.of(appName).to(channel).emit("message", payload);
  };

  return { handlePublish };
};
