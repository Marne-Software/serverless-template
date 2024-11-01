const AWS = require('aws-sdk');

// Initialize AWS IoT client with region
const iot = new AWS.Iot({ region: 'us-east-1' });  // Update the region if necessary

async function listPrincipalsForThing(thingName) {
    try {
        const response = await iot.listThingPrincipals({ thingName: thingName }).promise();
        const principalArns = response.principals;
        console.log('Principals attached to the thing:', principalArns);
        return principalArns;
    } catch (error) {
        console.error('Error listing principals for thing:', error);
    }
}

async function detachPolicyFromCertificate(policyName, certificateArn) {
    const params = {
        policyName: policyName,
        principal: certificateArn
    };
    
    try {
        const response = await iot.detachPrincipalPolicy(params).promise();
        console.log('Detached Policy:', response);
        return response;
    } catch (error) {
        console.error('Error detaching policy:', error);
    }
}

async function detachThingPrincipal(thingName, certificateArn) {
    const params = {
        thingName: thingName,
        principal: certificateArn
    };
    try {
        const response = await iot.detachThingPrincipal(params).promise();
        console.log('Detached Thing Principal:', response);
        return response;
    } catch (error) {
        console.error('Error detaching thing principal:', error);
    }
}

async function deactivateCertificate(certificateId) {
    const params = {
        certificateId: certificateId
    };
    try {
        const response = await iot.updateCertificate({ ...params, newStatus: 'INACTIVE' }).promise();
        console.log('Deactivated Certificate:', response);
        return response;
    } catch (error) {
        console.error('Error deactivating certificate:', error);
    }
}

async function deleteCertificate(certificateArn) {
    const certificateId = certificateArn.split('/').pop();  // Extract certificate ID from ARN
    await deactivateCertificate(certificateId);  // Deactivate the certificate before deleting

    const params = {
        certificateId: certificateId
    };
    try {
        const response = await iot.deleteCertificate(params).promise();
        console.log('Deleted Certificate:', response);
        return response;
    } catch (error) {
        console.error('Error deleting certificate:', error);
    }
}

async function deleteThing(thingName) {
    const params = {
        thingName: thingName
    };
    try {
        const response = await iot.deleteThing(params).promise();
        console.log('Deleted Thing:', response);
        return response;
    } catch (error) {
        console.error('Error deleting thing:', error);
    }
}

async function main() {
    const thingName = 'THE-staticid987654';
    const policyName = 'mcatDevicePolicy';  // Replace with your existing policy name

    // List principals attached to the thing
    const principalArns = await listPrincipalsForThing(thingName);

    if (principalArns && principalArns.length > 0) {
        for (const principalArn of principalArns) {
            // Detach the policy from each certificate
            await detachPolicyFromCertificate(policyName, principalArn);
            // Detach the certificate from the thing
            await detachThingPrincipal(thingName, principalArn);
            // Delete the certificate
            await deleteCertificate(principalArn);
        }
    }

    // Finally, delete the thing
    await deleteThing(thingName);
}

main();
