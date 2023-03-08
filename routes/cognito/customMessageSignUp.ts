import { formatEmail } from '../../utils/formatEmail';

export const customMessageSignUp = async ({ event }) => {
    event.response.emailSubject = `confirm your registration, ${event.request.userAttributes['custom:username']}!`;
    event.response.emailMessage = formatEmail(`hey!<p><a href="https://lambda.place4pals.com/public/confirm?username=${event.userName}&code=${event.request.codeParameter}&email=${event.request.userAttributes.email}">click this link to complete your registration.</a><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
    return event;
}