const AWS = require('aws-sdk');
const cloudformation = new AWS.CloudFormation({ region: 'us-east-1' });

async function getEnvFromStack(stage) {
  const stackName = stage === 'local' ? 'serverless-template-dev' : `serverless-template-${stage}`;

  const params = {
    StackName: stackName,
  };

  try {
    const data = await cloudformation.describeStacks(params).promise();

    if (!data.Stacks || data.Stacks.length === 0) {
      console.warn("No stacks found for the specified parameters.");
      return {};
    }

    const outputs = data.Stacks[0].Outputs;

    // Find and remap the ApiUrl output key to API_URL and add `/api` to the end
    let apiUrl = outputs.find(output => output.OutputKey === 'ApiUrl')?.OutputValue;
    if (!apiUrl) {
      console.warn("ApiUrl output key not found in stack outputs.");
      return {};
    }
    apiUrl = `${apiUrl}api`; // Append `/api` to the URL

    // Get the CloudFront Distribution ID
    const distributionId = outputs.find(output => output.OutputKey === 'CloudFrontDistributionId')?.OutputValue;
    if (!distributionId) {
      console.warn("CloudFrontDistributionId output key not found in stack outputs.");
      return {};
    }

    // Get the User Pool ID and Client ID
    const userPoolId = outputs.find(output => output.OutputKey === 'UserPoolId')?.OutputValue;
    if (!userPoolId) {
      console.warn("UserPoolId output key not found in stack outputs.");
      return {};
    }

    const userPoolClientId = outputs.find(output => output.OutputKey === 'UserPoolClientId')?.OutputValue;
    if (!userPoolClientId) {
      console.warn("UserPoolClientId output key not found in stack outputs.");
      return {};
    }

    // Return the configuration values with mapped keys
    if (stage === 'local') {
      return {
        API_URL: 'http://127.0.0.1:4000/api',
        DYNAMODB_ENDPOINT: 'http://host.docker.internal:8080',
        STAGE: stage,
        USER_POOL_ID: userPoolId,
        CLIENT_ID: userPoolClientId,
      };
    }

    return {
      API_URL: apiUrl,
      STAGE: stage,
      DISTRIBUTION_ID: distributionId,
      USER_POOL_ID: userPoolId,
      CLIENT_ID: userPoolClientId,
    };
  } catch (error) {
    console.error("Error fetching stack outputs:", error);
    throw error;
  }
}

// Run directly if not imported as a module
if (require.main === module) {
  const stage = process.argv[2]; // Read the stage from command-line arguments
  if (!stage) {
    console.error("Please provide a stage argument, e.g., 'node getEnvFromStack.js dev'");
    process.exit(1);
  }
  getEnvFromStack(stage)
    .then(envConfig => {
      // Wrap output in "Parameters" key for SAM CLI compatibility
      console.log(JSON.stringify({ Parameters: envConfig }, null, 2));
    })
    .catch(error => {
      console.error("An error occurred:", error);
      process.exit(1);
    });
}


module.exports = getEnvFromStack;
