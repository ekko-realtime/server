module.exports = (io) => {
  const Lambdas = require("../lib/lambdas/lambdas.js")(io);
  const { logEvent } = require("./logging.js")(io);

  const handlePublish = (socket, params) => {
    //publish(socket.appName, params);
    publish(socket, params);
  };

  // PRIVATE

  const publish = async (socket, params) => {
    let payload = { ...params };
    let { appName } = socket;
    let { channel, message } = params;

    const matchingLambdas = Lambdas.getMatchingLambdas(appName, channel);
    console.log("matchingLambdas ", matchingLambdas);
    logEvent({socket, eventName: `matching_lambdas: ${matchingLambdas}`});
    
    if (matchingLambdas) { 
      let updatedMessage = await Lambdas.processMessage({
        channel,
        message,
        lambdas: matchingLambdas,
      });

      if (!updatedMessage) {
        logEvent({socket, eventName: `nothing returned from lambdas`});
      } else {
        payload.message = updatedMessage;
      }
      //payload.message = updatedMessage ? updatedMessage : payload.message;
    }

    io.of(appName).to(channel).emit("message", payload);
  };

  return { handlePublish };
};