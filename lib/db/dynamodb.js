// TODO: revisit the billing part of this:
// if you use provisionedschema, it's more expensive than PAY_PER_REQUEST
// maybe have a Developer vs Production environment variable (like Heroku?)

let channelsVar;

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
    Key:{"channel": channel},
    UpdateExpression: "ADD #oldFunctions :newFunctions",
    ExpressionAttributeNames: {
      '#oldFunctions' : 'functionNames',
    },
    ExpressionAttributeValues: {":newFunctions": docClient.createSet([functionName])},
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
addFunctionToChannel('pizza', 'Dorey');

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
// removeFunctionFromChannel('very-fast', 'Will');

async function getAllChannels() {
  try {
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: constants.TABLE_NAME,
      ProjectionExpression: "channel",
    };

    let channelList = await docClient.scan(params).promise();
    return channelList.Items.map(channelObj => channelObj.channel);
  } catch (error) {
    console.error(error);
  }
}

// TODO: turn this into a test;

const testFunction = async () => {
  channelsVar = await getAllChannels();
  console.log(channelsVar);
}

// testFunction();

const getAssociatedFunctions = (channel) => {

};

// TODO: turn this into a test
// getAssociatedFunctions('Will');

const getAssociatedChannels = (functionName) => {

};

// TODO: turn this into a test
// getAssociatedChannels('slow');
