module.exports = (io) => {
  const Lambdas = require("../lib/lambdas/lambdas.js");
  const { logEvent } = require("./logging");

  const handlePublish = (socket, params) => {
    publish(socket.appName, params);
  };

  // PRIVATE

  const publish = async (appName, params) => {
    let payload = { ...params };
    let { app, channel, message } = params;
    app = "app_1"; //for testing, remove for production
    const matchingLambdas = Lambdas.getMatchingLambdas(app, channel);
    console.log("matchingLambdas ", matchingLambdas);

    if (matchingLambdas) {
      let response = await Lambdas.processMessage({
        channel,
        message,
        lambdas: matchingLambdas,
      });
      payload.message = response.message;
    }

    io.of(appName).to(channel).emit("message", payload);
  };

  return { handlePublish };
};
