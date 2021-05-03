const fs = require("fs").promises;
const AWS = require("aws-sdk");
const s3 = new AWS.S3(); //AWS configured and required in lambdas.js

const ASSOCIATIONS = "associations.json";

class AssociationsMgr {
  constructor({ loggingMgr }) {
    this.loggingMgr = loggingMgr;

    this.loadData();
  }

  //load new data from s3
  async loadData() {
    try {
      let params = {
        Bucket: process.env.S3_BUCKET,
        Key: ASSOCIATIONS,
      };

      let data = await s3.getObject(params).promise();
      this.data = JSON.parse(data.Body).applications;

      this.logTest(JSON.parse(data.Body));
    } catch (error) {
      this.data = undefined;
      this.logTest(error);
    }
  }

  updateData(stringData) {
    this.data = JSON.parse(stringData).applications;
  }

  handleUpdateAssociations(associations) {
    this.logTest("received new JSON");
    this.data = associations;
  }

  //REMOVE WHEN DONE TESTING
  logTest(event) {
    let socket = {
      uuid: "tester",
      admin: true,
      app: "app_1",
    };
    this.loggingMgr.logEvent({ socket, eventName: event });
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
