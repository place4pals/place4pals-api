import { randomUUID } from 'crypto';

export const customMessageUpdateUserAttribute = async ({ event, pool }) => {
    const code = randomUUID();
    await pool.query(`UPDATE users SET code='${code}' WHERE id='${event.userName}' `);

    event.response.emailSubject = `confirm your new email address, ${event.request.userAttributes['custom:username']}!`;
    event.response.emailMessage = formatEmailBody(`hey!<p><a href="https://lambda.place4pals.com/public/verify?username=${event.userName}&code=${event.request.codeParameter}">click this link to confirm your new email address.</a><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
    return event;
}