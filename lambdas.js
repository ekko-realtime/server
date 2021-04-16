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

//process a list of lambdas
const processMessage = async ({ channel, message, lambdas }) => {
  // console.log("PROCESS LAMBDAS:", channel, message, lambdas);

  for (let idx = 0; idx < lambdas.length; idx += 1) {
    let currentLambda = lambdas[idx];
    message = await callLambda({ message, currentLambda });
  }
  
  return { message };
};

const callLambda = async ({ message, currentLambda }) => {
  //comsole.log("CALL LAMBDA ", currentLambda, message);
  try {
    const params = {
      FunctionName: currentLambda,
      Payload: JSON.stringify({ message }),
    };
    
    const result = await lambda.invoke(params).promise();
    return JSON.parse(result.Payload).body.message;
  } catch (error) {
    console.error("Error invoking lambda: ", error);
  }
};

module.exports = {
  getAllLambdaData,
  processMessage,
  getMatchingLambdas,
};
