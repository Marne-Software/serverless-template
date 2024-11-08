const awsConfig = {
  Auth: {
      region: process.env.AWS_REGION || 'us-east-1', 
      userPoolId: process.env.USER_POOL_ID || 'YOUR_USER_POOL_ID',
      userPoolWebClientId: process.env.CLIENT_ID || 'YOUR_USER_POOL_WEB_CLIENT_ID'
  },
};

export default awsConfig;
