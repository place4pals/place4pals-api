import { formatEmail } from '../../utils/formatEmail';

export const customMessageForgotPassword = async ({ event }) => {
    event.response.emailSubject = `reset your password, ${event.request.userAttributes['preferred_username']}`;
    event.response.emailMessage = formatEmail(`hey there, ${event.request.userAttributes['preferred_username']}!<p>we received a request to reset your password.</p><p><a href="https://p4p.io/set?email=${event.request.userAttributes.email}&code=${event.request.codeParameter}">click this link to set your new password.</a><p>if you did not request this, you can ignore this email.</p><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes['email']);

    return event;
}