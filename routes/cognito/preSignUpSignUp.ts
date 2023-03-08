import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
const cognito = new CognitoIdentityProvider();

export const preSignUpSignUp = async ({ event }) => {
    //check if the username exists in current cognito pool or not
    const usernameSearch = await cognito.listUsers({
        UserPoolId: process.env.userPoolId,
        AttributesToGet: ['email'],
        Filter: `preferred_username = "${event.request.userAttributes['custom:username']}"`,
        Limit: 1
    });

    const emailSearch = await cognito.listUsers({
        UserPoolId: process.env.userPoolId,
        AttributesToGet: ['email'],
        Filter: `email = "${event.request.userAttributes['email']}"`,
        Limit: 1
    });

    if (usernameSearch.Users.length === 0 && emailSearch.Users.length === 0) {
        // event.response.autoConfirmUser = true;
        return event;
    }
    else {
        return false;
    }
}