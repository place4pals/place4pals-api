import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
const cognito = new CognitoIdentityProvider();

export const reset = async ({ event, pool }) => {
    await cognito.confirmForgotPassword({ ClientId: process.env.clientId, ConfirmationCode: event.queryStringParameters.code, Password: event.queryStringParameters.password, Username: event.queryStringParameters.username });
    return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': 'https://place4pals.com' } };
}