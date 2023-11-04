import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { client, event } from "#src/utils";
const cognito = new CognitoIdentityProvider();

export const postConfirmationConfirmSignUp = async () => {
    const { sub, email, ['custom:username']: username } = event.request.userAttributes;
    await cognito.adminUpdateUserAttributes({
        UserAttributes: [{ Name: 'preferred_username', Value: username }],
        UserPoolId: process.env.userPoolId,
        Username: event.userName
    });
    await client.connect();
    await client.query(`INSERT INTO "users" ("id","email","name") VALUES ($1, $2, $3)`, [sub, email, username]);
    await client.clean();
    return event;
}