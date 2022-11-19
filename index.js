import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { SES } from '@aws-sdk/client-ses';
import pg from 'pg';
import { formatEmailBody } from './email.js';
import { Expo } from 'expo-server-sdk';
import { randomUUID } from 'crypto';

const { Pool } = pg;
const connectionString = process.env.connectionString;

const compressUuid = (uuid) => {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('base64').replace('==', '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const handler = async (event) => {
    console.log("place4pals init", event);
    event.body ? event.body = JSON.parse(event.body) : null;

    if (['TokenGeneration_Authentication', 'TokenGeneration_RefreshTokens', 'TokenGeneration_AuthenticateDevice'].includes(event.triggerSource)) {
        event.response = {
            claimsOverrideDetails: {
                claimsToAddOrOverride: {
                    "https://hasura.io/jwt/claims": JSON.stringify({
                        "x-hasura-allowed-roles": ["user"],
                        "x-hasura-default-role": "user",
                        "x-hasura-user-id": event.request.userAttributes.sub,
                        "x-hasura-role": "user"
                    })
                }
            }
        };
        return event;
    }
    else if (event.triggerSource === "PreSignUp_SignUp") {
        //check if the username exists in current cognito pool or not
        const cipc = new CognitoIdentityProvider();
        const usernameSearch = await cipc.listUsers({
            UserPoolId: process.env.userPoolId,
            AttributesToGet: ['email'],
            Filter: `preferred_username = "${event.request.userAttributes['custom:username']}"`,
            Limit: 1
        });

        let emailSearch = await cipc.listUsers({
            UserPoolId: process.env.userPoolId,
            AttributesToGet: ['email'],
            Filter: `email = "${event.request.userAttributes['email']}"`,
            Limit: 1
        });

        if (usernameSearch.Users.length === 0 && emailSearch.Users.length === 0) {
            // event.response.autoConfirmUser = true;
            return event;
        }
        else {
            return false;
        }
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
        let pool = new Pool({ connectionString });
        await pool.query('INSERT INTO users(id, email, username, user_type) VALUES($1, $2, $3, $4) RETURNING *', [event.request.userAttributes['sub'], event.request.userAttributes['email'], event.request.userAttributes['custom:username'], event.request.userAttributes['custom:userType']]);
        pool.end();

        const cipc = new CognitoIdentityProvider();
        await cipc.adminUpdateUserAttributes({
            UserAttributes: [{
                Name: 'preferred_username',
                Value: event.request.userAttributes['custom:username']
            }, {
                Name: 'email_verified',
                Value: 'true'
            }],
            UserPoolId: process.env.userPoolId,
            Username: event.userName
        });

        //send welcome email
        await new SES({ region: 'us-east-1' }).sendEmail({
            Destination: { ToAddresses: [event.request.userAttributes['email']] },
            Message: {
                Subject: { Data: `welcome to place4pals, ${event.request.userAttributes['custom:username']}!` },
                Body: {
                    Html: { Data: formatEmailBody(`hey there, ${event.request.userAttributes['custom:username']}!<p><a href="https://p4p.io/login?email=${event.request.userAttributes.email}">click this link to login.</a><p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
                }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        });

        //send admin user signup message
        await new SES({ region: 'us-east-1' }).sendEmail({
            Destination: { ToAddresses: ['chris@place4pals.com'] },
            Message: {
                Subject: { Data: `place4pals event: ${event.request.userAttributes['custom:username']} (${event.request.userAttributes['email']}) just signed up` },
                Body: {
                    Html: { Data: formatEmailBody(`hey admin,<p>${event.request.userAttributes['custom:username']} (${event.request.userAttributes['email']}) just signed up!<p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
                }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        });

        return event;
    }
    else if (event.triggerSource === 'CustomMessage_SignUp') {
        event.response.emailSubject = `confirm your registration, ${event.request.userAttributes['custom:username']}!`;
        event.response.emailMessage = formatEmailBody(`hey!<p><a href="https://lambda.place4pals.com/public/confirm?username=${event.userName}&code=${event.request.codeParameter}&email=${event.request.userAttributes.email}">click this link to complete your registration.</a><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
        return event;
    }
    else if (event.triggerSource === 'CustomMessage_UpdateUserAttribute') {
        let pool = new Pool({ connectionString });
        let code = randomUUID();
        await pool.query(`UPDATE users SET code='${code}' WHERE id='${event.userName}' `);

        event.response.emailSubject = `confirm your new email address, ${event.request.userAttributes['custom:username']}!`;
        event.response.emailMessage = formatEmailBody(`hey!<p><a href="https://lambda.place4pals.com/public/verify?username=${event.userName}&code=${event.request.codeParameter}">click this link to confirm your new email address.</a><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
        return event;
    }
    else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        event.response.emailSubject = `reset your password, ${event.request.userAttributes['preferred_username']}`;
        event.response.emailMessage = formatEmailBody(`hey there, ${event.request.userAttributes['preferred_username']}!<p>we received a request to reset your password.</p><p><a href="https://p4p.io/set?email=${event.request.userAttributes.email}&code=${event.request.codeParameter}">click this link to set your new password.</a><p>if you did not request this, you can ignore this email.</p><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes['email']);

        return event;
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmForgotPassword') {
        //send email letting user know someone reset their password
        await new SES({ region: 'us-east-1' }).sendEmail({
            Destination: { ToAddresses: [event.request.userAttributes['email']] },
            Message: {
                Body: {
                    Html: { Data: formatEmailBody(`hey there, ${event.request.userAttributes['custom:username']},<p>you've successfully changed your password! if you did not do this, we highly recommend changing your password immediately.</p><p><a href="https://p4p.io/reset?email=${event.request.userAttributes.email}">click this link to change your password again.</a><p>otherwise, you can ignore this email.</p><p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
                },
                Subject: { Data: `alert: you changed your password, ${event.request.userAttributes['custom:username']}` }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        });
        return event;
    }

    if (event.path.startsWith('/public')) {
        if (event.path.endsWith('/reset')) {
            const cipc = new CognitoIdentityProvider();
            await cipc.confirmForgotPassword({ ClientId: process.env.clientId, ConfirmationCode: event.queryStringParameters.code, Password: event.queryStringParameters.password, Username: event.queryStringParameters.username });
            return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': 'https://place4pals.com' } };
        }
        else if (event.path.endsWith('/confirm')) {
            const cipc = new CognitoIdentityProvider();
            try {
                await cipc.confirmSignUp({ ClientId: process.env.clientId, ConfirmationCode: event.queryStringParameters.code, Username: event.queryStringParameters.username });
            }
            catch (err) {
                console.log(err);
            }
            return {
                statusCode: 302,
                body: null,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Location': `${event.headers['CloudFront-Is-Mobile-Viewer']==='true' ? `p4p://` : `https://place4pals.com/`}login?email=${event.queryStringParameters.email}`
                }
            };
        }
        else if (event.path.endsWith('/verify')) {
            const cipc = new CognitoIdentityProvider();

            let pool = new Pool({ connectionString });
            let response = await pool.query(`SELECT code FROM users WHERE id='${event.queryStringParameters.username}' `);

            if (response.rows[0].code !== event.queryStringParameters.code) {
                return { statusCode: 200, body: "sorry, the code you provided to verify your email address is invalid", headers: { 'Access-Control-Allow-Origin': '*' } };
            }
            else {
                try {
                    await cipc.adminUpdateUserAttributes({
                        UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
                        UserPoolId: process.env.userPoolId,
                        Username: event.queryStringParameters.username

                    });
                    return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': `https://place4pals.com` } };
                }
                catch (err) {
                    return { statusCode: 200, body: JSON.stringify(err), headers: { 'Access-Control-Allow-Origin': '*' } };
                }
            }
        }
        else if (event.path.endsWith('/unsubscribe')) {
            return {
                statusCode: 200,
                body: `${event.queryStringParameters.email} is now unsubscribed!`,
                headers: { 'Access-Control-Allow-Origin': '*' }
            };
        }
        else if (event.path.endsWith('/internetTest')) {
            let response = await (await fetch('https://api.htic.io/test')).text();
            return {
                statusCode: 200,
                body: JSON.stringify(response),
                headers: { 'Access-Control-Allow-Origin': '*' }
            };
        }
        else if (event.path.endsWith('/hasura')) {
            const pool = new Pool({ connectionString });
            if (event.body.event.data.new) {
                const payload = event.body.event.data.new;
                const commentFrom = (await pool.query('SELECT users.id, username FROM users WHERE id=$1', [payload.user_id])).rows[0];
                const commentTo = (await pool.query('SELECT users.id, username, push_token, email FROM posts JOIN users ON posts.user_id=users.id WHERE posts.id=$1', [payload.post_id])).rows[0];
                if (commentFrom.id !== commentTo.id) {
                    if (commentTo.push_token) {
                        let expo = new Expo();
                        await expo.sendPushNotificationsAsync([{
                            to: commentTo.push_token,
                            // sound: 'default',
                            title: `${commentFrom.username} commented on your post`,
                            body: `${payload.content}`,
                            data: { url: `p4p://posts/${compressUuid(payload.post_id)}` },
                        }]);
                    }
                    if (commentTo.email) {
                        await new SES({ region: 'us-east-1' }).sendEmail({
                            Destination: { ToAddresses: [commentTo.email] },
                            Message: {
                                Subject: { Data: `${commentFrom.username} commented on your post` },
                                Body: {
                                    Html: { Data: formatEmailBody(`hey ${commentTo.username}!<p><a href="https://
                                    place4pals.com/users/${compressUuid(commentFrom.id)}">${commentFrom.username}</a> commented on your <a href="https://place4pals.com/posts/${compressUuid(payload.post_id)}">post</a>:<div style="padding: 10px;margin:10px;background-color:#ffffff99;border-radius:10px;">${payload.content}</div><p>thanks,<br>place4pals`, commentTo.email) }
                                }
                            },
                            Source: 'place4pals <noreply@place4pals.com>',
                            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
                        });
                    }
                }
            }
            return {
                statusCode: 200,
                body: JSON.stringify(event),
                headers: { 'Access-Control-Allow-Origin': '*' }
            };
        }
    }
    else if (event.path.startsWith('/auth')) {}
    else if (event.path.startsWith('/test')) {
        await new SES({ region: 'us-east-1' }).sendEmail({
            Destination: { ToAddresses: ['chris@productabot.com'] },
            Message: {
                Subject: { Data: `Welcome to place4pals!` },
                Body: {
                    Html: { Data: formatEmailBody(`hey!<p><a href="https://p4p.io/login">click this link to login.</a><p>thanks,<br>place4pals`, 'chris@productabot.com') }
                }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        });
    }
    else {
        //we're redirecting to a user profile based on a given username
        let hostSplit = event.headers.Host.split('.');
        let pool = new Pool({ connectionString });
        let response = await pool.query('SELECT id FROM users WHERE username=$1', [hostSplit[0]]);
        let redirectDomain = event.headers.Host.split('.').slice(1).join('.');
        return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': response.rows.length > 0 ? `https://${redirectDomain}/users/${compressUuid(response.rows[0].id)}` : `https://${redirectDomain}` } };
    }
};
