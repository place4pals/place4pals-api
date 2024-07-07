import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { db, event } from "#src/utils";
const cognito = new CognitoIdentityProvider();

export const postConfirmationConfirmSignUp = async () => {
    const { sub, email, nickname } = event.request.userAttributes;
    await cognito.adminUpdateUserAttributes({
        UserAttributes: [{ Name: 'preferred_username', Value: nickname }],
        UserPoolId: process.env.USER_POOL_ID,
        Username: event.userName
    });
    await db.connect();
    await db.query(`INSERT INTO "users" ("id","email","username") VALUES ($1, $2, $3)`, [sub, email, nickname]);
    await db.clean();
    return event;
}