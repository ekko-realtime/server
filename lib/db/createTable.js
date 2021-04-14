// TODO: revisit the billing part of this:
// if you use provisionedschema, it's more expensive than PAY_PER_REQUEST
// maybe have a Developer vs Production environment variable (like Heroku?)

require('dotenv').config({path: '../../.env'});
const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT
});

const dynamodb = new AWS.DynamoDB();

// TODO: take out the tablename as a constant into a /constants file
const params = {
  TableName : "ekko-function-channel-pairs",
  KeySchema: [
    { AttributeName: "channel", KeyType: "HASH"},  // Partition key
  ],
  BillingMode: "PROVISIONED",
  AttributeDefinitions: [
    { AttributeName: "channel", AttributeType: "S" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

const createTable = () => {
  dynamodb.createTable(params, function(err, data) {
    if (err) {
      console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
  });
}

//TODO make this into a test?
//createTable();

module.exports = { createTable };
