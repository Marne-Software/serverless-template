import { defineConfig } from 'cypress';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import dotenv from 'dotenv'; // Use dotenv to load environment variables

const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1', // Replace with your AWS region
});

interface ParseXlsxParams {
  filePath: string;
}

dotenv.config();

export default defineConfig({
  env: {
    STAGE: process.env.STAGE,
    BASE_URL: process.env.BASE_URL
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        changeUserRoleToRequester(email) {
          const cognito = new AWS.CognitoIdentityServiceProvider();
          const params = {
            UserPoolId: process.env.USER_POOL_ID, // Set your User Pool ID here
            Username: email,
            UserAttributes: [
              {
                Name: 'custom:role',
                Value: 'requester'
              },
            ],
          };

          return cognito.adminUpdateUserAttributes(params).promise()
            .then(() => {
              return null; // Return null to indicate the task was successful
            })
            .catch((error) => {
              throw new Error(error.message);
            });
        },
        parseXlsx: ({ filePath }: ParseXlsxParams) => {
          return new Promise((resolve, reject) => {
            try {
              // Read file content as binary
              const fileContent = fs.readFileSync(filePath, 'binary');

              // Parse the file content using xlsx
              const jsonData = xlsx.read(fileContent, { type: 'binary' });

              resolve(jsonData);
            } catch (e) {
              reject(e);
            }
          });
        },
        validateParsedData: ({ jsonData, expectedData }) => {
          try {
            expect(jsonData.data).to.deep.equal(expectedData);
            return null; // Resolve the promise, indicating success
          } catch (e) {
            return e; // Reject the promise with the error, indicating failure
          }
        },
      });

      return config; // Return the updated config
    },
  },
});