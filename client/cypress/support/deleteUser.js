const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS(); // Add SNS to handle subscription management

async function unsubscribeUserFromEmailSNSTopics(email) {
  try {
    let nextToken; // For pagination
    do {
      // List all subscriptions with pagination
      const params = nextToken ? { NextToken: nextToken } : {};
      console.log('Listing subscriptions with params:', params);
      const response = await sns.listSubscriptions(params).promise();

      // Filter subscriptions for the specific email and valid SubscriptionArn
      const emailSubscriptions = response.Subscriptions.filter(
        (subscription) =>
          subscription.Endpoint === email &&
          subscription.SubscriptionArn &&
          subscription.SubscriptionArn.split(':').length >= 6
      );

      console.log("Filtered Email Subscriptions:", emailSubscriptions);

      // Unsubscribe the user from each valid topic
      for (const subscription of emailSubscriptions) {
        try {
          await sns
            .unsubscribe({ SubscriptionArn: subscription.SubscriptionArn })
            .promise();
          console.log(`Unsubscribed from: ${subscription.SubscriptionArn}`);
        } catch (unsubscribeError) {
          console.error(`Failed to unsubscribe from ${subscription.SubscriptionArn}:`, unsubscribeError);
        }
      }

      // Update the next token for pagination
      nextToken = response.NextToken;

    } while (nextToken);

  } catch (error) {
    console.error("Error unsubscribing email from SNS topics:", error);
  }
}

async function deleteUserByEmail(email) {
  try {
    const userPoolID = process.env.USER_POOL_ID; // Retrieve User Pool ID from environment variables
    console.log("userPoolID: ", userPoolID);

    // Get user data from Cognito
    let userData;
    try {
      userData = await cognito
        .adminGetUser({
          UserPoolId: userPoolID,
          Username: email,
        })
        .promise();
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        console.log(`User with email ${email} does not exist in Cognito.`);
        // Attempt to unsubscribe from SNS regardless of user existence
        await unsubscribeUserFromEmailSNSTopics(email);
        return; // Exit the function gracefully
      } else {
        throw error; // Rethrow other errors
      }
    }

    // Unsubscribe user from all SNS topics
    await unsubscribeUserFromEmailSNSTopics(email);

    // Delete user from Cognito
    await cognito
      .adminDeleteUser({
        UserPoolId: userPoolID,
        Username: email,
      })
      .promise();

    console.log(`User with email ${email} deleted successfully from Cognito.`);

    // Additional logic for DynamoDB deletion can be added here if needed

  } catch (error) {
    console.error("Error:", error);
  }
}

const emailToDelete = 'mcat-' + process.env.MCAT_USER + '@hylugahk.mailosaur.net';
console.log("emailToDelete: ", emailToDelete);
deleteUserByEmail(emailToDelete);
