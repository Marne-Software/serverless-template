// Load environment variables from .env file
require('dotenv').config();

// Access environment variables
const userPoolId = process.env.USER_POOL_ID;
const baseUrl = process.env.BASE_URL;
const clientId = process.env.CLIENT_ID;
const identityPoolId = process.env.IDENTITY_POOL_ID;

// Example function to use the environment variables
function logEnvVariables() {
  console.log('User Pool ID:', userPoolId);
  console.log('Base URL:', baseUrl);
  console.log('Client ID:', clientId);
  console.log('Identity Pool ID:', identityPoolId);
}

// Call the function to log environment variables
logEnvVariables();
