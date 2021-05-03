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
  async processMessage({ message, lambdas }) {
    for (let idx = 0; idx < lambdas.length; idx += 1) {
      let currentLambda = lambdas[idx];
      message = await this.callLambda({ message, currentLambda });
    }
    return message;
  }

  async callLambda({ message, currentLambda }) {
    try {
      const params = {
        FunctionName: currentLambda,
        Payload: JSON.stringify(message),
      };

      const result = await lambda.invoke(params).promise();
      return JSON.parse(result.Payload);
    } catch (error) {
      console.error("Error invoking lambda: ", error);
      return undefined;
    }
  }
}

module.exports = LambdaMgr;
