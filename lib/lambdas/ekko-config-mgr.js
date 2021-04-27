const fs = require("fs").promises;
const AWS = require("aws-sdk");
const s3  = new AWS.S3(); //AWS configured and required in lambdas.js

const ASSOCIATIONS = "associations.json";

class EkkoConfigMgr {
  constructor({ setLoadInterval }) {
    console.log("creating ConfigMgr")
    this.loadData();

    //pass in boolean for whether or not you want to repeatedly 
    //load new data from s3
    if (setLoadInterval) {
      this.syncDataInterval = setInterval(this.loadData, 60000);
    }
  }

  async loadData() {
    //console.log("loadData");
    try {
      //for local data, uncomment below
      //let data = await fs.readFile('./lib/lambdas/associations.json');
     
      //for live data, uncomment below
      let params = {
        Bucket: process.env.S3_BUCKET, // this is my bucket, the cdk generated one will have a different name
        Key: ASSOCIATIONS,
      }
      let data = await s3.getObject(params).promise();

      this.formatData(JSON.parse(data.Body));
    } catch (error) {
      console.error("error loading json ", error);
    }
  }

  formatData(data) {
    console.log("formatData ", data);
    this.data = data.applications;
  }

  getData() {
    return this.data;
  }

  getChannelData(applicationName, channelName) {
    let channels = this.data[applicationName].channels;

    let matchingChannel = channels.find(channelData => {
      let reg = new RegExp('^' + channelData.channelName);
      return reg.test(channelName);
    });

    return matchingChannel;
  }

  getFunctionsByChannel(applicationName, channelName) {
    let matchingChannel = this.getChannelData(applicationName, channelName);
    return matchingChannel ? matchingChannel.functionNames : undefined;
  }

  getAllChannelNames(appName) {
    let channels = this.data[appName].channels;
    return channels.map(channelData => channelData.channelName);
  }
}

module.exports = EkkoConfigMgr;