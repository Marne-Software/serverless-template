const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const AWS = require("aws-sdk");

// Configure AWS SDK to connect to DynamoDB Local
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
    endpoint: "http://localhost:8080", // local DynamoDB endpoint
});

// Add default AWS configuration with region
AWS.config.update({ region: "us-east-1" });

const tableName = "mcatInvestigationTable-"  + process.env.STAGE;

// Function to add items to DynamoDB
async function addItemToDynamoDB(item) {
    const params = {
        TableName: tableName,
        Item: item,
    };

    try {
        await dynamoDB.put(params).promise();
        console.log(`Successfully added investigation for device with ID: ${item.deviceID}`);
    } catch (error) {
        console.error("Error adding item to DynamoDB:", error);
    }
}

// Function to load JSON from file and add to DynamoDB
async function addJsonFromFileToDynamoDB(jsonFilePath) {
    try {
        const fileData = fs.readFileSync(jsonFilePath, "utf8");
        const items = JSON.parse(fileData);
        
        if (Array.isArray(items)) {
            for (const item of items) {
                await addItemToDynamoDB(item);
            }
        } else {
            await addItemToDynamoDB(items);
        }
    } catch (error) {
        console.error("Error processing file or adding items to DynamoDB:", error);
    }
}

// Example usage
const jsonFilePath = path.resolve(__dirname, "../../../services/seedData/investigationTableSeed.json"); // Path to your JSON file
addJsonFromFileToDynamoDB(jsonFilePath);
