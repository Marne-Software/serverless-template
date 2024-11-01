const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const AWS = require("aws-sdk");

// Configure AWS SDK to connect to DynamoDB Local
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
  endpoint: "http://localhost:8080", // local DynamoDB endpoint
});

// Add default AWS configuration with region
AWS.config.update({ region: "us-east-1" });

const cognito = new AWS.CognitoIdentityServiceProvider(); // Use default AWS config for Cognito
const tableName = "mcatUserTable-" + process.env.STAGE;
const userPoolId = process.env.USER_POOL_ID; // replace with your Cognito User Pool ID

async function getUsernameFromCognito(email) {
  const listUsersParams = {
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
    Limit: 1,
  };

  try {
    const result = await cognito.listUsers(listUsersParams).promise();
    if (result.Users.length > 0) {
      return result.Users[0].Username;
    } else {
      throw new Error("User not found in Cognito");
    }
  } catch (error) {
    console.error("Error fetching user from Cognito:", error);
    throw error;
  }
}

async function createUserInDynamoDB(email) {
  try {
    const username = await getUsernameFromCognito(email);

    const params = {
      TableName: tableName,
      Item: {
        id: username, // Use the Cognito username as the ID
        post: "fort-stewart",
        subscribedBuildings: [],
        defaultBuilding: "",
      },
    };

    await dynamoDB.put(params).promise();
    console.log(`Successfully created user in DynamoDB with ID: ${username}`);
  } catch (error) {
    console.error("Error creating user in DynamoDB:", error);
  }
}

createUserInDynamoDB( "mcat-" + process.env.MCAT_USER + "@hylugahk.mailosaur.net" );