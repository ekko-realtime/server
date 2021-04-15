const db = require('./dynamodb');

class DynamoMgr {
  constructor({ setLoadInterval }) {
    this.loadData();

    //pass in boolean for whether or not you want to repeatedly 
    //load new data from database
    if (setLoadInterval) {
      this.syncDataInterval = setInterval(this.loadData, 5000);
    }
  }

  async loadData() {
    let response = await db.loadAllData();
    console.log("loaded data: ", data);
    this.formatData(response);
  }

  formatData(data) {
    let formattedData = {};
    data.forEach(item => {
      if (item.functionNames) {
        formattedData[item.channel] = item.functionNames.values;
      }
    });
    this.data = formattedData;
  }

  getAssociatedFunctions(channelName) {
    return this.data[channelName];
  }

  getAssociatedChannels(functionName) {
    let matchingChannels = [];
    let channelNames = Object.keys(this.data);

    channelNames.forEach(name => {
      if (this.data[name].includes(functionName)) {
        if (!matchingChannels.includes(name)) {
          matchingChannels.push(name);
        }
      }
    });

    return matchingChannels;
  }

  getAllChannelNames() {
    return Object.keys(this.data);
  }
}