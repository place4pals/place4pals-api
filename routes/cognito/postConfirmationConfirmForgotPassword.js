import { SES } from '@aws-sdk/client-ses';
import { formatEmail } from '../../utils/formatEmail';
const ses = new SES({ region: 'us-east-1' });

export const postConfirmationConfirmForgotPassword = async ({ event }) => {
    //send email letting user know someone reset their password
    await ses.sendEmail({
        Destination: { ToAddresses: [event.request.userAttributes['email']] },
        Message: {
            Body: {
                Html: { Data: formatEmail(`hey there, ${event.request.userAttributes['custom:username']},<p>you've successfully changed your password! if you did not do this, we highly recommend changing your password immediately.</p><p><a href="https://p4p.io/reset?email=${event.request.userAttributes.email}">click this link to change your password again.</a><p>otherwise, you can ignore this email.</p><p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
            },
            Subject: { Data: `alert: you changed your password, ${event.request.userAttributes['custom:username']}` }
        },
        Source: 'place4pals <noreply@place4pals.com>',
        ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
    });
    return event;
}