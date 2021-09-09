const AWS = require("aws-sdk");
const _s3 = new AWS.S3(); //AWS configured and required in lambdas.js

const ASSOCIATIONS = "associations.json";

class AssociationsMgr {
  constructor({ loggingMgr, s3 = _s3 }) {
    this.loggingMgr = loggingMgr;
    this.s3 = s3;
    this.loadData();
  }

  //load new data from s3
  async loadData() {
    try {
      let params = {
        Bucket: process.env.S3_BUCKET,
        Key: ASSOCIATIONS,
      };

      let data = await this.s3.getObject(params).promise();
      this.handleUpdateAssociations(data.Body);
    } catch (error) {
      this.data = undefined;
      console.error("error loading from s3 ", error);
    }
  }

  updateData(stringData) {
    this.data = JSON.parse(stringData).applications;
  }

  handleUpdateAssociations(associations) {
    this.data = JSON.parse(associations).applications;
  }

  getData() {
    return this.data;
  }

  getChannelData(applicationName, channelName) {
    if (!this.data || !this.data[applicationName]) return undefined;

    let channels = this.data[applicationName].channels;

    let matchingChannel = channels.find((channelData) => {
      let reg = new RegExp("^" + channelData.channelName);
      return reg.test(channelName);
    });

    return matchingChannel;
  }

  getFunctionsByChannel(applicationName, channelName) {
    if (!this.data || !this.data[applicationName]) return undefined;
    let matchingChannel = this.getChannelData(applicationName, channelName);
    return matchingChannel ? matchingChannel.functionNames : undefined;
  }
}

module.exports = AssociationsMgr;
