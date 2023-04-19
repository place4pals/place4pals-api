import { formatEmail } from '../../utils/formatEmail';

export const customMessageForgotPassword = async ({ event }) => {
    event.response.emailSubject = `Reset your password, ${event.request.userAttributes['preferred_username']}`;
    event.response.emailMessage = formatEmail({ event, body: `<p>We received a request to reset your password.</p><p><a href="http://127.0.0.1:5173/set?email=${event.request.userAttributes.email}&code=${event.request.codeParameter}">Click this link to set your new password.</a><p>If you did not request this, you can ignore this email.</p>` });

    return event;
}