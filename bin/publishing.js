module.exports = ({ io, lambdaMgr }) => {
  const { logEvent } = require("./logging.js")(io);

  const handlePublish = (socket, params) => {
    publish(socket, params);
  };

  // PRIVATE

  const publish = async (socket, params) => {
    let payload = { ...params };
    let { appName } = socket;
    let { channel, message } = params;

    const matchingLambdas = lambdaMgr.getMatchingLambdas(appName, channel);
    logEvent({ socket, eventName: `matching_lambdas: ${matchingLambdas}` });

    if (matchingLambdas) {
      let updatedMessage = await lambdaMgr.processMessage({
        channel,
        message,
        lambdas: matchingLambdas,
      });

      if (!updatedMessage) {
        logEvent({ socket, eventName: `nothing returned from lambdas` });
      } else {
        payload.message = updatedMessage;
      }
    }

    io.of(appName).to(channel).emit("message", payload);
  };

  return { handlePublish };
};
