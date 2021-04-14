// TODO: revisit the billing part of this:
// if you use provisionedschema, it's more expensive than PAY_PER_REQUEST
// maybe have a Developer vs Production environment variable (like Heroku?)

require('dotenv').config({path: '../../.env'});
const AWS = require("aws-sdk");
const constants = require('../../constants/constants');
AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT
});

const addChannel = (channelName) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: constants.TABLE_NAME,
    Item:{
      "channel": channelName,
    }
  };

  console.log("Adding a new item...");
  docClient.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });
};

// TODO: pull out into a test
// addChannel('Will');

const removeChannel = (channel) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
    TableName: constants.TABLE_NAME,
    Key:{
      "channel": channel,
    },
  };

  console.log("Attempting a conditional delete...");
  docClient.delete(params, function(err, data) {
    if (err) {
      console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

const addFunctionToChannel = (functionName, channel) => {
  const docClient = new AWS.DynamoDB.DocumentClient()

  var params = {
    TableName: constants.TABLE_NAME,
    Key:{
      "channel": channel,
    },
    UpdateExpression: "SET functionNames = if_not_exists(functionNames, :f)",
    ExpressionAttributeValues: {":f": functionName},
    ReturnValues:"UPDATED_NEW"
  };

  console.log("Updating the item...");
  docClient.update(params, function(err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

// TODO: pull out into a test
// addFunctionToChannel('very-fast', 'Will');

const removeFunctionFromChannel = (functionName, channel) => {
  const docClient = new AWS.DynamoDB.DocumentClient()

  var params = {
    TableName: constants.TABLE_NAME,
    Key:{
      "channel": channel,
    },
    UpdateExpression: "SET functionNames = :f",
    ExpressionAttributeValues: {":f": ""},
    ReturnValues:"UPDATED_NEW"
  };

  console.log("Updating the item...");
  docClient.update(params, function(err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};

// TODO: pull out into a test
// removeFunctionFromChannel('anything', 'Will');

const getAllChannels = async () => {

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
      TableName: constants.TABLE_NAME,
      ProjectionExpression: "channel",
  };

  let channelList = await docClient.scan(params, onScan).promise();
  console.log("channelList: ", channelList);
  channelList = channelList.Items.map(channelObj => channelObj.channel);

  function onScan(err, data) {
      if (err) {
          console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("Scan succeeded.");
          // console.log("data", data);
          // console.log(data.Items);
          // return data.Items;
      }
  }

  console.log("channelList2: ", channelList);
  return channelList;
};

// TODO: turn this into a test
// addChannel('Dorey');
// addChannel('Alex');
//let allChannels = getAllChannels();
//console.log(allChannels);

const getAssociatedFunctions = (channel) => {

};

// TODO: turn this into a test
// getAssociatedFunctions('Will');

const getAssociatedChannels = (functionName) => {

};

// TODO: turn this into a test
// getAssociatedChannels('slow');
