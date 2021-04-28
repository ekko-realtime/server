const fs = require("fs").promises;
const AWS = require("aws-sdk");
const s3  = new AWS.S3(); //AWS configured and required in lambdas.js

const ASSOCIATIONS = "associations.json";

class AssociationsMgr {
  constructor({ setLoadInterval }) {
    this.loadData();

    //pass in boolean for whether or not you want to repeatedly 
    if (setLoadInterval) {
      this.syncDataInterval = setInterval(this.loadData, 60000);
    }
  }

  //load new data from s3
  async loadData() {
    console.log("loadData");
    try {
      //for local data, uncomment below
      //this.data = await fs.readFile('./lib/lambdas/associations.json');
      //end local data
     
      //for live data, uncomment below
      let params = {
        Bucket: process.env.S3_BUCKET,
        Key: ASSOCIATIONS,
      }
      let data = await s3.getObject(params).promise();
      this.data = JSON.parse(data.Body).applications;
      //end live data
      console.log("data: ", JSON.parse(data.Body));
      
    } catch (error) {
      console.error("error loading json ", error);
    }
  }

  getData() {
    return this.data;
  }

  getChannelData(applicationName, channelName) {
    if (!this.data || !this.data[applicationName]) return undefined;
    let channels = this.data[applicationName].channels;
    //console.log("found channels ", channels);
    let matchingChannel = channels.find(channelData => {
      let reg = new RegExp('^' + channelData.channelName);
      return reg.test(channelName);
    });

    return matchingChannel;
  }

  getFunctionsByChannel(applicationName, channelName) {
    if (!this.data || !this.data[applicationName]) return undefined;
    let matchingChannel = this.getChannelData(applicationName, channelName);
    return matchingChannel ? matchingChannel.functionNames : undefined;
  }

  getAllChannelNames(applicationName) {
    if (!this.data || !this.data[applicationName]) return undefined;
    let channels = this.data[appName].channels;
    return channels.map(channelData => channelData.channelName);
  }
}

module.exports = AssociationsMgr;