const db = require('./dynamodb');

class DynamoMgr {
  constructor({ setLoadInterval }) {
    console.log("creating DynamoMgr")
    this.loadData();

    //pass in boolean for whether or not you want to repeatedly 
    //load new data from database
    if (setLoadInterval) {
      this.syncDataInterval = setInterval(this.loadData, 5000);
    }
  }

  async loadData() {
    let response = await db.loadAllData();
    this.formatData(response.Items);
  }

  formatData(data) {
    let formattedData = data.map(item => {
      let lambdas = item.functionNames ? item.functionNames.values : [];

      return { 
        channel: item.channel, 
        functionNames: lambdas
      }
    });
    // console.log("formatData ", formattedData);
    this.data = formattedData;
  }

  getData() {
    return this.data;
  }

  getDBChannel(channelName) {
    // console.log("getDBChannel ", channelName);
    
    let matchingChannel = this.data.find(item => {
      let reg = new RegExp('^' + item.channel);
      // console.log("item channel ", item.channel);
      return reg.test(channelName);
    });
    return matchingChannel;
  }

  getFunctionsByChannel(channelName) {
    let matchingChannel = this.getDBChannel(channelName);
    return matchingChannel && matchingChannel.functionNames 
      ? matchingChannel.functionNames 
      : undefined;
  }

  getChannelsByFunction(functionName) {
    let matchingChannels = this.data.filter(item => {
      return item.functionNames.includes(functionName);
    });

    return matchingChannels;
  }

  getAllChannelNames() {
    return this.data.map(item => item.channel);
  }
}

module.exports = DynamoMgr;