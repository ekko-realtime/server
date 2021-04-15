// TODO: revisit the billing part of this:
// if you use provisionedschema, it's more expensive than PAY_PER_REQUEST
// maybe have a Developer vs Production environment variable (like Heroku?)

require('dotenv').config({path: '../../.env'});


const AWS = require("aws-sdk");
const dynamoEP = new AWS.Endpoint(process.env.AWS_DB_ENDPOINT);
const dynamoConfig = {
  region: process.env.AWS_REGION,
  endpoint: dynamoEP
}
const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);

const constants = require('../../constants/constants');


const addChannel = async (channelName) => {
  try {
    const params = {
      TableName: constants.TABLE_NAME,
      Item:{
        "channel": channelName,
      }
    };

    let response = await docClient.put(params).promise();
    console.log("Added chanel: " + channelName);
  } catch (error) {
    console.error("Unable to add channel. Error JSON:", JSON.stringify(error, null, 2));
  }
};

// addChannel('Sebastian');

const removeChannel = async (channelName) => {
  try {
    const params = {
      TableName: constants.TABLE_NAME,
      Key:{
        "channel": channelName,
      },
    };

    let response = await docClient.delete(params).promise();
    console.log("Deleted channel: " + channelName);
  } catch (error) {
    console.error("Unable to delete channel", JSON.stringify(error, null, 2))
  }
};

// removeChannel('Sebastian');

const addFunctionToChannel = async (functionName, channelName) => {
  try {
    const params = {
      TableName: constants.TABLE_NAME,
      Key:{"channel": channelName},
      UpdateExpression: "ADD #oldFunctions :newFunctions",
      ExpressionAttributeNames: {
        '#oldFunctions' : 'functionNames',
      },
      ExpressionAttributeValues: {":newFunctions": docClient.createSet([functionName])},
      ReturnValues:"UPDATED_NEW"
    };

    let response = await docClient.update(params).promise();
    console.log("added function to channel", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Unable to add function to channel", error);
  }
};

// addFunctionToChannel('balls', 'Dorey');

const removeFunctionFromChannel = async (functionName, channelName) => {
  try {
    const params = {
      TableName: constants.TABLE_NAME,
      Key:{"channel": channelName},
      UpdateExpression: "DELETE #oldFunctions :newFunctions",
      ExpressionAttributeNames: {
        '#oldFunctions' : 'functionNames',
      },
      ExpressionAttributeValues: {":newFunctions": docClient.createSet([functionName])},
      ReturnValues:"UPDATED_NEW"
    };

    let response = await docClient.update(params).promise();
    console.log("UpdateItem succeeded:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Unable to remove function from channel: ", error);
  }
};

// removeFunctionFromChannel('balls', 'Dorey');

// grabbing all channels from dynamoDB (vs. getting all channels from loaded data)
const getAllChannelsFromDB = async () => {
  try {
    const params = {
      TableName: constants.TABLE_NAME,
      ProjectionExpression: "channel",
    };

    let channelList = await docClient.scan(params).promise();
    console.log("Grabbed all channels from DB: ", channelList.Items)
    return channelList.Items.map(channelObj => channelObj.channel);
  } catch (error) {
    console.error("Unable to get all channels from DB: ", error);
  }
};

const getFunctionsByChannelFromDB = async (channelName) => {
  try {
    const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: constants.TABLE_NAME,
      Key: {
        'channel': channelName,
      }
    };

    let result = await ddbDocumentClient.get(params).promise();
    return result.Item.functionNames.values;
  } catch (error) {
    console.error("Unable to get functionNames from channel name: ", error);
  }
};

const loadAllData = async () =>  {
  console.log("loadAllData");
  try {
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: constants.TABLE_NAME,
      ProjectionExpression: "channel, functionNames",
    };

    let data = await docClient.scan(params).promise();
    console.log("data loaded: ", data);
    return data;
  } catch (error) {
    console.error("Unable to get all data from DB: ", error);
  }
};

// loadAllData();

//couldn't figure this out through database...to use this you need to 
//pass in loaded data from loadAllData() or it will load the data for you
const getChannelsByFunction = async (functionName, data) => {

  if (!data) {
    data = await loadAllData();
  }

  let matchingChannels = [];
  let channelNames = Object.keys(data);

  console.log(channelNames);

  channelNames.forEach(name => {
    if (data[name].includes(functionName)) {
      if (!matchingChannels.includes(name)) {
        matchingChannels.push(name);
      }
    }
  });

  return matchingChannels;
}


exports.loadAllData = loadAllData;
exports.getChannelsByFunction = getChannelsByFunction;
exports.getFunctionsByChannelFromDB = getFunctionsByChannelFromDB;
exports.getAllChannelsFromDB = getAllChannelsFromDB;
exports.removeFunctionFromChannel = removeFunctionFromChannel;
exports.addFunctionToChannel = addFunctionToChannel;
exports.addChannel = addChannel;
exports.removeChannel = removeChannel;