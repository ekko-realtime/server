// TODO: revisit the billing part of this:
// if you use provisionedschema, it's more expensive than PAY_PER_REQUEST
// maybe have a Developer vs Production environment variable (like Heroku?)

require('dotenv').config();
const AWS = require("aws-sdk");

//TODO: fix dotenv import of our environment variables

let aws_region = "us-east-1";
let aws_endpoint = "https://dynamodb.us-east-1.amazonaws.com";

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

// addChannel('Will');

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

// addFunctionToChannel('very-fast', 'Will');

const removeFunctionFromChannel = (functionName, channel) => {
  const docClient = new AWS.DynamoDB.DocumentClient()

  var params = {
    TableName: table,
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

// removeFunctionFromChannel('anything', 'Will');

const getAllChannels = async () => {

  const docClient = new AWS.DynamoDB.DocumentClient();

  const params = {
      TableName: table,
      ProjectionExpression: "channel",
  };


  // let channelList = await docClient.scan(params, onScan);
  // channelList = channelList.map(channelObj => channelObj.channel);

  // function onScan(err, data) {
  //     if (err) {
  //         console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
  //     } else {
  //         console.log("Scan succeeded.");
          
  //         console.log(data.Items);
  //         return data.Items;
  //     }

  // }
  // return channelList;

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

// addChannel('Dorey');
// addChannel('Alex');
let allChannels = getAllChannels();
console.log(allChannels);

const getAssociatedFunctions = (channel) => {

};

const getAssociatedChannels = (functionName) => {

};
