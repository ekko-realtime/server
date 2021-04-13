require("dotenv").config();

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const lambda = new AWS.Lambda();

const db = { balloon: "slow" };

const hasLambda = (channel) => db[channel];

const callLambda = async ({ channel, message }) => {
  console.log("CALLING LAMBDA:", channel, message);

  const params = {
    FunctionName: db[channel],
    Payload: JSON.stringify({ message: message }),
  };

  const result = await lambda.invoke(params).promise();
  return JSON.parse(result.Payload).body;
};

module.exports = {
  callLambda,
  hasLambda,
};
