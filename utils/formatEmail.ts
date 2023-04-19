export const formatEmail = ({ event, body }) => {
    return `Hey ${event.request.userAttributes['preferred_username']},
    <p>${body}</p>
    <p>Thanks,
    <br/>place4pals</p>
    <p><img width="100" src="https://staging.place4pals.com/favicon.png"></p>
    ${event?.request?.codeParameter ? `<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>` : ''}`;
};
