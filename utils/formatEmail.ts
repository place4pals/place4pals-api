export const formatEmail = ({ event, body }) => {
    return `<p><img width="200" src="https://staging.place4pals.com/small_logo.png"></p>
    Hey ${event?.request?.userAttributes?.preferred_username ?? 'pal'},
    <p>${body}</p>
    <p>Thanks,
    <br/>place4pals</p>
    ${event?.request?.codeParameter ? `<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>` : ''}`;
};
