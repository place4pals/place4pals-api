import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
const cognito = new CognitoIdentityProvider();

export const confirm = async ({ event, pool }) => {
    try {
        await cognito.confirmSignUp({ ClientId: process.env.clientId, ConfirmationCode: event.queryStringParameters.code, Username: event.queryStringParameters.username });
    }
    catch (err) {
        console.log(err);
    }
    return {
        statusCode: 302,
        body: null,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Location': `${event.headers['CloudFront-Is-Mobile-Viewer'] === 'true' ? `p4p://` : `https://place4pals.com/`}login?email=${event.queryStringParameters.email}`
        }
    };
}