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
  // TODO: consider breaking the docClient out into the main code body
  // (and do it for all the functions below)
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
// addFunctionToChannel('pizza', 'Dorey');

const removeFunctionFromChannel = (functionName, channel) => {
  const docClient = new AWS.DynamoDB.DocumentClient()

  var params = {
    TableName: constants.TABLE_NAME,
    Key:{"channel": channel},
    UpdateExpression: "DELETE #oldFunctions :newFunctions",
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
// removeFunctionFromChannel('pizza', 'Dorey');

// TODO: make this a synchronous mapping function
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
  let channelsVar = await getAllChannels();
  console.log(channelsVar);
}

// testFunction();

const getAssociatedFunctions = async (channel) => {
  try {
    const ddbDocumentClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: constants.TABLE_NAME,
      Key: {
        'channel': channel,
      }
    };

    let result = await ddbDocumentClient.get(params).promise();
    return result.Item.functionNames.values;
  } catch (error) {
    console.error(error);
  }
};

// TODO: turn this into a test

const testFunctionForAssocFunctions = async () => {
  let testVar = await getAssociatedFunctions('Dorey');
  console.log(testVar);
}

// testFunctionForAssocFunctions();

async function getAllData() {
  try {
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: constants.TABLE_NAME,
      ProjectionExpression: "channel, functionNames",
    };

    let channelList = await docClient.scan(params).promise();
    let data = channelList.Items;
    let output = {};
    data.forEach(item => {
      // TODO: Guard against manual entries that are NOT sets already
      if (item.functionNames) {
        output[item.channel] = item.functionNames.values;
      }
    });
    return output;
  } catch (error) {
    console.error(error);
  }
}

// TODO: turn this into a test;

const testFunction3 = async () => {
  let channelsVar = await getAllData();
  console.log(channelsVar);
}

// testFunction3();

const getAssociatedChannels = (functionName, data) => {
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

const testFunction4 = async () => {
  let data = await getAllData();
  return getAssociatedChannels("doughnut", data);
}

// console.log(testFunction4());
