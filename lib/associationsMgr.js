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
    console.log("loadData");
    try {
      //for local data, uncomment below
      //this.data = await fs.readFile('./lib/associations.json');
      //end local data

      //for live data, uncomment below
      let params = {
        Bucket: process.env.S3_BUCKET,
        Key: ASSOCIATIONS,
      };

      let data = await s3.getObject(params).promise();
      this.data = JSON.parse(data.Body).applications;
      //end live data

      this.logTest(JSON.parse(data.Body));
    } catch (error) {
      this.logTest(error);
      this.data = undefined;
    }
  }

  updateData(stringData) {
    this.data = JSON.parse(stringData).applications;
    console.log("updatedData: ", this.data);
  }

  handleUpdateAssociations(associations) {
    console.log("handleUpdateAssociations: ", associations);
    this.logTest("received new JSON");
    this.data = associations;
  }

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
