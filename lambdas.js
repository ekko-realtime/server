const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: "AKIAQ7EEXEND2AFKWN5N",
  secretAccessKey: "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",
  region: "us-east-2",
});
const lambda = new AWS.Lambda();

const db = { balloon: "slow" };

const hasLambda = (channel) => db[channel];

const callLambda = async ({ channel, eventType, data }) => {
  console.log("CALLING LAMBDA:", channel, eventType, data);

  const params = {
    FunctionName: db[channel],
    Payload: JSON.stringify({ message: data }),
  };

  let lambdaResponse;
  const result = await lambda.invoke(params).promise();
  // const result = await lambda.invokeAsync(params);

  return JSON.parse(result.Payload).body;
  //     // console.log("RESPONSE", result);
  //     lambdaResponse = JSON.parse(response.Payload).body;
  //     // io.emit("thought", );
};

module.exports = {
  callLambda,
  hasLambda,
};
