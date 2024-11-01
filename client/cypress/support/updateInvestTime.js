const AWS = require('aws-sdk');

// Configure AWS region
AWS.config.update({
    region: "us-east-1" // Update with your region
});

// Create a DynamoDB DocumentClient
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to get the Unix time 15 days prior to the present
function getPastUnixTime(days) {
    const now = new Date();
    now.setDate(now.getDate() - days);
    return Math.floor(now.getTime() / 1000); // Convert milliseconds to seconds
}

// Define the primary and sort key values
const buildingID = 'fsga_MIC';
const deviceID = 'THE-staticid987654';

// Define the table name
const tableName = 'mcatInvestigationTable-test';

// Define the new lastUpdated value (15 days from now)
const lastUpdated = getPastUnixTime(15);

// Update the item in DynamoDB
const params = {
    TableName: tableName,
    Key: {
        buildingID: buildingID,
        deviceID: deviceID
    },
    UpdateExpression: 'SET lastUpdated = :lastUpdated',
    ExpressionAttributeValues: {
        ':lastUpdated': lastUpdated
    }
};

// Perform the update operation
dynamoDB.update(params, (err, data) => {
    if (err) {
        console.error('Error updating item:', err);
    } else {
        console.log('Update successful:', data);
    }
});
