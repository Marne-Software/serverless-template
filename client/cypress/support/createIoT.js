const AWS = require('aws-sdk');

// Initialize AWS IoT client with region
const iot = new AWS.Iot({ region: 'us-east-1' });  // Update the region if necessary

async function createThing(thingName, attributes) {
    const params = {
        thingName: thingName,
        attributePayload: {
            attributes: attributes
        }
    };
    try {
        const response = await iot.createThing(params).promise();
        console.log('Created Thing:', response);
        return response;
    } catch (error) {
        console.error('Error creating thing:', error);
    }
}

async function createKeysAndCertificate() {
    try {
        const response = await iot.createKeysAndCertificate({ setAsActive: true }).promise();
        console.log('Certificate Response:', response);
        return response;
    } catch (error) {
        console.error('Error creating keys and certificate:', error);
    }
}

async function attachThingPrincipal(thingName, certificateArn) {
    const params = {
        thingName: thingName,
        principal: certificateArn
    };
    try {
        const response = await iot.attachThingPrincipal(params).promise();
        console.log('Attached Thing Principal:', response);
        return response;
    } catch (error) {
        console.error('Error attaching thing principal:', error);
    }
}

async function attachPolicyToCertificate(policyName, certificateArn) {
    const params = {
        policyName: policyName,
        principal: certificateArn
    };
    try {
        const response = await iot.attachPrincipalPolicy(params).promise();
        console.log('Attached Policy:', response);
        return response;
    } catch (error) {
        console.error('Error attaching policy:', error);
    }
}

async function main() {
    const thingName = 'THE-staticid987654';
    const attributes = {
        location: 'office',
        roomID: 'fsga_MIC_office'
    };
    const policyName = 'mcatDevicePolicy';  // Replace with your existing policy name

    // Create the IoT thing
    const thingResponse = await createThing(thingName, attributes);
    
    // Create the keys and certificate
    const certResponse = await createKeysAndCertificate();
    const certificateArn = certResponse.certificateArn;

    // Attach the existing policy to the certificate
    await attachPolicyToCertificate(policyName, certificateArn);

    // Attach the certificate to the thing
    await attachThingPrincipal(thingName, certificateArn);
}

main();
