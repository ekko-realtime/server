module.exports = (io) => {
  const Lambdas = require("../lib/lambdas/lambdas.js");

  const handlePublish = (socket, params) => {
    publish(socket.appName, params);
  };

  // PRIVATE

  const publish = async (appName, params) => {
    let payload = { ...params };
    let { channel, message } = params;
    const matchingLambdas = Lambdas.getMatchingLambdas(appName, channel);
    console.log("matchingLambdas ", matchingLambdas);

    if (matchingLambdas) {
      let updatedMessage = await Lambdas.processMessage({
        channel,
        message,
        lambdas: matchingLambdas,
      });
      payload.message = updatedMessage ? updatedMessage : payload.message;
    }

    io.of(appName).to(channel).emit("message", payload);
  };

  return { handlePublish };
};
