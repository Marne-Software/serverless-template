const AWS = require('aws-sdk');

// Configure AWS SDK for local DynamoDB
const localDynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:8080' // Local DynamoDB endpoint
});

// Configure AWS SDK for online DynamoDB
const onlineDynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
});

// Choose the appropriate DynamoDB client based on the environment
const dynamoDBClient = process.env.STAGE === "test" ? onlineDynamoDB : localDynamoDB;

const addEntryToDynamoDB = (entry) => {
    const params = {
        TableName: 'mcatDeviceTable-' + process.env.STAGE, // Replace with your DynamoDB table name
        Item: entry,
    };
    
    return dynamoDBClient.put(params).promise()
        .then(() => {
            console.log('Added entry:', entry);
        })
        .catch((error) => {
            console.log('Error adding entry:', error);
        });
};

// Parse the entry from command line arguments
const entry = JSON.parse(process.argv[2].replace(/\\"/g, '"'));
addEntryToDynamoDB(entry);
