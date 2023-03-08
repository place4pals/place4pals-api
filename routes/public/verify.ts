import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
const cognito = new CognitoIdentityProvider();

export const verify = async ({ event, pool }) => {
    const response = await pool.query(`SELECT code FROM users WHERE id='${event.queryStringParameters.username}' `);

    if (response.rows[0].code !== event.queryStringParameters.code) {
        return { statusCode: 200, body: "sorry, the code you provided to verify your email address is invalid", headers: { 'Access-Control-Allow-Origin': '*' } };
    }
    else {
        try {
            await cognito.adminUpdateUserAttributes({
                UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
                UserPoolId: process.env.userPoolId,
                Username: event.queryStringParameters.username

            });
            return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': `https://place4pals.com` } };
        }
        catch (err) {
            return { statusCode: 200, body: JSON.stringify(err), headers: { 'Access-Control-Allow-Origin': '*' } };
        }
    }
}