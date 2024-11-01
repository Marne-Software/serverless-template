const AWS = require('aws-sdk');

// Initialize AWS IoT client with region
const iotData = new AWS.IotData({
    endpoint: 'aadoidw8sa8dp-ats.iot.us-east-1.amazonaws.com',  // Replace with your IoT endpoint
    region: 'us-east-1'  // Add region information here
});

async function publishMessage(message, topic) {
    const params = {
        topic: topic,
        qos: 1,
        payload: message
    };
    try {
        const response = await iotData.publish(params).promise();
        console.log('Publish Response:', response);
        return response;
    } catch (error) {
        console.error('Error publishing message:', error);
    }
}

async function main() {
    const topic = 'test/THE-staticid987654/fsga_MIC_office';
    const message = process.argv[2];
    await publishMessage(message, topic);
}

main();
