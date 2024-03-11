import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { client, event } from "#src/utils";
const cognito = new CognitoIdentityProvider();

export const postConfirmationConfirmSignUp = async () => {
    const { sub, email, nickname } = event.request.userAttributes;
    await cognito.adminUpdateUserAttributes({
        UserAttributes: [{ Name: 'preferred_username', Value: nickname }],
        UserPoolId: process.env.USER_POOL_ID,
        Username: event.userName
    });
    await client.connect();
    await client.query(`INSERT INTO "users" ("id","email","username") VALUES ($1, $2, $3)`, [sub, email, nickname]);
    await client.clean();
    return event;
}