import { formatEmail } from '../../utils/formatEmail';

export const customMessageSignUp = async ({ event }) => {
    event.response.emailSubject = `Confirm your account, ${event.request.userAttributes['custom:username']}!`;
    event.response.emailMessage = formatEmail(`Hey!<p><a href="http://127.0.0.1:5173/?username=${event.userName}&code=${event.request.codeParameter}">click this link to complete your registration.</a><p>Thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
    return event;
}