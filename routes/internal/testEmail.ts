import { formatEmail } from '../../utils/formatEmail';
import { SES } from '@aws-sdk/client-ses';
const ses = new SES({ region: 'us-east-1' });

export const testEmail = async ({ event }) => {
    await ses.sendEmail({
        Destination: {
            ToAddresses: ['c@htic.io']
        },
        Message: {
            Subject: { Data: `Test email` },
            Body: {
                Html: { Data: formatEmail({ event, body: `This is a test email.` }) }
            },
        },
        Source: 'place4pals <noreply@place4pals.com>',
        ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
    });

    return true;
}