import { Expo } from 'expo-server-sdk';
import { SES } from '@aws-sdk/client-ses';
import { formatEmail } from '../../utils/formatEmail';
import { compressUuid } from '../../utils/compressUuid';
const ses = new SES({ region: 'us-east-1' });

export const commentNotifications = async ({ event, pool }) => {
    const payload = event.body.event.data.new;
    const commentFrom = (await pool.query('SELECT users.id, username FROM users WHERE id=$1', [payload.user_id])).rows[0];
    const commentTo = (await pool.query('SELECT users.id, username, push_token, email FROM posts JOIN users ON posts.user_id=users.id WHERE posts.id=$1', [payload.post_id])).rows[0];
    if (commentFrom.id !== commentTo.id) {
        if (commentTo.push_token) {
            const expo = new Expo();
            await expo.sendPushNotificationsAsync([{
                to: commentTo.push_token,
                // sound: 'default',
                title: `${commentFrom.username} commented on your post`,
                body: `${payload.content}`,
                data: { url: `p4p://posts/${compressUuid(payload.post_id)}` },
            }]);
        }
        if (commentTo.email) {
            await ses.sendEmail({
                Destination: { ToAddresses: [commentTo.email] },
                Message: {
                    Subject: { Data: `${commentFrom.username} commented on your post` },
                    Body: {
                        Html: {
                            Data: formatEmail(`hey ${commentTo.username}!<p><a href="https://
                            place4pals.com/users/${compressUuid(commentFrom.id)}">${commentFrom.username}</a> commented on your <a href="https://place4pals.com/posts/${compressUuid(payload.post_id)}">post</a>:<div style="padding: 10px;margin:10px;background-color:#ffffff99;border-radius:10px;">${payload.content}</div><p>thanks,<br>place4pals`, commentTo.email)
                        }
                    }
                },
                Source: 'place4pals <noreply@place4pals.com>',
                ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
            });
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(event),
        headers: { 'Access-Control-Allow-Origin': '*' }
    };
}