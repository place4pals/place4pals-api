import { event } from '#src/utils';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
const cognito = new CognitoIdentityProvider();

export const preSignUpSignUp = async () => {
    const emailSearch = await cognito.listUsers({
        UserPoolId: process.env.USER_POOL_ID,
        AttributesToGet: ['email'],
        Filter: `email = "${event.request.userAttributes['email']}"`,
        Limit: 1
    });

    if (emailSearch.Users.length === 0) {
        event.response.autoConfirmUser = true;
        event.response.autoVerifyEmail = true;
        return event;
    }
    else {
        return false;
    }
}