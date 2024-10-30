module.exports = async ({ options, resolveVariable }) => {
    const stageFromOptions = options.stage;
    const stage = stageFromOptions || (await resolveVariable('opt:stage'));


    const AWS = require('aws-sdk');
    AWS.config.update({ region: 'us-east-1' });

    const baseConfig = {
        AWS_ACCESS_KEY_ID: AWS.config.credentials.accessKeyId,
        AWS_SECRET_ACCESS_KEY: AWS.config.credentials.secretAccessKey,
        SERVERLESS_LICENSE_KEY: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJzY3JpcHRpb25JZCI6IjZhMzRmZWFlLWExZTEtNGUxMi04OTYwLWI5YWQ1Njg4Y2Y3NCIsIm9yZ0lkIjoiYzY1NTI0ZGEtYWE4Yi00ZDI5LWFiYzktODRhMWY5ZWNkODBkIiwiaWF0IjoxNzMwMzEwNDkwLCJleHAiOjE3NjE4NDY0OTAsImlzcyI6ImFwcC5zZXJ2ZXJsZXNzLmNvbSJ9.Pz8RuuuPk474F_YGHUTXAfSaZs_L5gSA9v1KNSCQGJKFODsAaK0CjhGJjOq1jJbnoH1doNQfwB1bAzhqO9XlROZpZfszB8c67N0WoAkxRMNZ5S_fSif137JLi60xZ-Q0vRx5Yn3epvQLN8xKx3WLvXzb_AR9oHV5FfgfTqArjQzmDB8TjvlPiwDcNnLRhmb_Q4a_cCz9dW5K5YCcT-oamKp3JsrxSZkV0GMo_YNSTRmplkTrEWP-BQsFiwqciv4lPa7YDfKAU7o5cmnxOKMn6519IhqrkV4iXtqQhTpw0j1Pl5Uofluj4XbzfK6ky4ts4jyGm80DydXrROkHbEvYyg'
    };

    switch (stage) {
        case 'local':
            return {
                ...baseConfig,
            };
    }
}
