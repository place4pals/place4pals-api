import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { SES } from '@aws-sdk/client-ses';
import { formatEmail } from '../../utils/formatEmail';
const cognito = new CognitoIdentityProvider();
const ses = new SES({ region: 'us-east-1' });

export const postConfirmationConfirmSignUp = async ({ event, pool }) => {
    await pool.query('INSERT INTO users(id, email, username, user_type) VALUES($1, $2, $3, $4) RETURNING *', [event.request.userAttributes['sub'], event.request.userAttributes['email'], event.request.userAttributes['custom:username'], event.request.userAttributes['custom:userType']]);
    pool.end();

    await cognito.adminUpdateUserAttributes({
        UserAttributes: [{
            Name: 'preferred_username',
            Value: event.request.userAttributes['custom:username']
        }, {
            Name: 'email_verified',
            Value: 'true'
        }],
        UserPoolId: process.env.userPoolId,
        Username: event.userName
    });

    //send welcome email
    await ses.sendEmail({
        Destination: { ToAddresses: [event.request.userAttributes['email']] },
        Message: {
            Subject: { Data: `welcome to place4pals, ${event.request.userAttributes['custom:username']}!` },
            Body: {
                Html: { Data: formatEmail(`hey there, ${event.request.userAttributes['custom:username']}!<p><a href="https://p4p.io/login?email=${event.request.userAttributes.email}">click this link to login.</a><p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
            }
        },
        Source: 'place4pals <noreply@place4pals.com>',
        ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
    });

    //send admin user signup message
    await ses.sendEmail({
        Destination: { ToAddresses: ['chris@place4pals.com'] },
        Message: {
            Subject: { Data: `place4pals event: ${event.request.userAttributes['custom:username']} (${event.request.userAttributes['email']}) just signed up` },
            Body: {
                Html: { Data: formatEmail(`hey admin,<p>${event.request.userAttributes['custom:username']} (${event.request.userAttributes['email']}) just signed up!<p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
            }
        },
        Source: 'place4pals <noreply@place4pals.com>',
        ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
    });

    return event;
}