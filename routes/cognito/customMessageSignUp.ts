import { formatEmail, event } from '#src/utils';

export const customMessageSignUp = async () => {
    event.response.emailSubject = `Confirm your account, ${event.request.userAttributes['custom:username']}`;
    event.response.emailMessage = formatEmail({ event, body: `<p><a href="https://place4pals.com/?username=${event.userName}&code=${event.request.codeParameter}">Click this link to complete your registration.</a></p>` });
    return event;
}