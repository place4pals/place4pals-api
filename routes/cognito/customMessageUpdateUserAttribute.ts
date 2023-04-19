import { formatEmail } from '../../utils/formatEmail';

export const customMessageUpdateUserAttribute = async ({ event }) => {
    event.response.emailSubject = `Confirm your new email address, ${event.request.userAttributes['custom:username']}`;
    event.response.emailMessage = formatEmail({ event, body: `<p><a href="http://127.0.0.1:5173/verify?username=${event.userName}&code=${event.request.codeParameter}">Click this link to confirm your new email address.</a></p>` });
    return event;
}