import { query } from "../../utils/query";
import { generateId } from "../../utils/ksuid";
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
const cognito = new CognitoIdentityProvider();

export const postConfirmationConfirmSignUp = async ({ event }) => {
    const userId = generateId();

    await cognito.adminUpdateUserAttributes({
        UserAttributes: [{
            Name: 'preferred_username',
            Value: event.request.userAttributes['custom:username']
        },
        {
            Name: 'profile',
            Value: userId
        }],
        UserPoolId: process.env.userPoolId,
        Username: event.userName
    });

    await query(`INSERT INTO "place4pals" VALUE {
        'parent_id':'user', 
        'id':'user#${userId}', 
        'email':?,
        'name':?
    }`, null, [{ S: event.request.userAttributes['email'] }, { S: event.request.userAttributes['custom:username'] }]);

    return event;
}