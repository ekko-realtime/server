// TODO: revisit the billing part of this:
// if you use provisionedschema, it's more expensive than PAY_PER_REQUEST
// maybe have a Developer vs Production environment variable (like Heroku?)

require('dotenv').config();
const AWS = require("aws-sdk");

//TODO: fix dotenv import of our environment variables

let aws_region = "me-south-1";
let aws_endpoint = "https://dynamodb.me-south-1.amazonaws.com";

AWS.config.update({
  region: aws_region,
  endpoint: aws_endpoint
});

const table = "ekko-function-channel-pairs";

const addChannel = (channelName) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: table,
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

//addChannel('Will');

const removeChannel = (channel) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  var params = {
    TableName: table,
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
    TableName: table,
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

addFunctionToChannel('very-fast', 'Will');

const removeFunctionFromChannel = (functionName, channel) => {

};

const getAllChannels = () => {

};

const getAssociatedFunctions = (channel) => {

};

const getAssociatedChannels = (functionName) => {

};
