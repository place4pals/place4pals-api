import { formatEmail } from '../../utils/formatEmail';

export const customMessageSignUp = async ({ event }) => {
    event.response.emailSubject = `Confirm your account, ${event.request.userAttributes['custom:username']}`;
    event.response.emailMessage = formatEmail({ event, body: `<p><a href="http://127.0.0.1:5173/?username=${event.userName}&code=${event.request.codeParameter}">Click this link to complete your registration.</a></p>` });
    return event;
}