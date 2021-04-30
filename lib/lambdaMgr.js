const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const lambda = new AWS.Lambda();

class LambdaMgr {
  constructor({ associationsMgr, io }) {
    (this.associationsMgr = associationsMgr), (this.io = io);
  }

  getMatchingLambdas(app, channel) {
    if (!app) return undefined;
    return this.associationsMgr.getFunctionsByChannel(app, channel);
  }

  //process a list of lambdas
  async processMessage({ channel, message, lambdas }) {
    //console.log("PROCESS LAMBDAS:", channel, message, lambdas);
    for (let idx = 0; idx < lambdas.length; idx += 1) {
      let currentLambda = lambdas[idx];
      message = await callLambda({ message, currentLambda });
    }
    return message;
  }

  async callLambda({ message, currentLambda }) {
    //console.log("CALL LAMBDA ", currentLambda, message);
    try {
      const params = {
        FunctionName: currentLambda,
        Payload: JSON.stringify(message),
      };

      const result = await lambda.invoke(params).promise();
      return JSON.parse(result.Payload);
    } catch (error) {
      return error;
      console.error("Error invoking lambda: ", error);
    }
  }
}

module.exports = LambdaMgr;

// require("dotenv").config(); // TODO: I don't think this line is needed anymore

// module.exports = (io) => {
// const AssociationsMgr = require("./associationsMgr");
// const lambdaConfigMgr = new AssociationsMgr({ setLoadInterval: true, io });

// const getAllLambdaData = () => {
//   return lambdaConfigMgr.getData();
// };

// return { getAllLambdaData, processMessage, getMatchingLambdas };
// };

// module.exports = {
//   getAllLambdaData,
//   processMessage,
//   getMatchingLambdas,
// };
