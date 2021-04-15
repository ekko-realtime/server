require("dotenv").config();

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const DynamoMgr = require("./lib/db/DynamoMgr");
const db = new DynamoMgr({setLoadInterval: false});
const lambda = new AWS.Lambda();

const getAllLambdaData = () => {
  return db.getData();
};

const getMatchingLambdas = (channel) => {
  return db.getFunctionsByChannel(channel);
};

const processMessage = async ({ channel, message, lambdas }) => {
  console.log("CALLING LAMBDA:", channel, message);
  console.log("call lambda ", lambdas[0]);

  try {
    const params = {
      FunctionName: lambdas[0],
      Payload: JSON.stringify({ message }),
    };
  
    const result = await lambda.invoke(params).promise();
    // console.log("result ", result);
    return JSON.parse(result.Payload).body;
  } catch (error) {
    console.error("Error invoking lambda: ", error);
  }
};

module.exports = {
  getAllLambdaData,
  processMessage,
  getMatchingLambdas,
};
