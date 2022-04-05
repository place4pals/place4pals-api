const aws = require('aws-sdk');
const { Pool } = require('pg');
const poolConfig = {
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
};
const { formatEmailBody } = require('./email.js');
const { Expo } = require('expo-server-sdk');

exports.handler = async (event, context) => {
    console.log("place4pals init", event);
    event.body ? event.body = JSON.parse(event.body) : null;

    if (['TokenGeneration_Authentication', 'TokenGeneration_RefreshTokens'].includes(event.triggerSource)) {
        event.response = {
            "claimsOverrideDetails": {
                "claimsToAddOrOverride": {
                    "https://hasura.io/jwt/claims": JSON.stringify({
                        "x-hasura-allowed-roles": ["user", "admin"],
                        "x-hasura-default-role": "user",
                        "x-hasura-user-id": event.request.userAttributes.sub,
                        "x-hasura-role": "user"
                    })
                }
            }
        };
        return context.done(null, event);
    }
    else if (event.triggerSource === "PreSignUp_SignUp") {
        //check if the username exists in current cognito pool or not
        const cisp = new aws.CognitoIdentityServiceProvider();
        const usernameSearch = await cisp.listUsers({
            UserPoolId: process.env.userPoolId,
            AttributesToGet: ['email'],
            Filter: `preferred_username = "${event.request.userAttributes['custom:username']}"`,
            Limit: '1'
        }).promise();

        let emailSearch = await cisp.listUsers({
            UserPoolId: process.env.userPoolId,
            AttributesToGet: ['email'],
            Filter: `email = "${event.request.userAttributes['email']}"`,
            Limit: '1'
        }).promise();

        if (usernameSearch.Users.length === 0 && emailSearch.Users.length === 0) {
            // event.response.autoConfirmUser = true;
            return context.done(null, event);
        }
        else {
            return false;
        }
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
        let pool = new Pool(poolConfig);
        let response = await pool.query('INSERT INTO users(id, email, username, user_type) VALUES($1, $2, $3, $4) RETURNING *', [event.request.userAttributes['sub'], event.request.userAttributes['email'], event.request.userAttributes['custom:username'], event.request.userAttributes['custom:userType']]);
        console.log(response);
        pool.end();

        const cisp = new aws.CognitoIdentityServiceProvider();
        await cisp.adminUpdateUserAttributes({
            UserAttributes: [{
                Name: 'preferred_username',
                Value: event.request.userAttributes['custom:username']
            }, {
                Name: 'email_verified',
                Value: 'true'
            }],
            UserPoolId: process.env.userPoolId,
            Username: event.userName
        }).promise();

        //send welcome email
        aws.config.update({ region: 'us-east-1' });
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: [event.request.userAttributes['email']] },
            Message: {
                Subject: { Data: `welcome to place4pals, ${event.request.userAttributes['custom:username']}!` },
                Body: {
                    Html: { Data: formatEmailBody(`hey there, ${event.request.userAttributes['custom:username']}!<p><a href="https://app.p4p.io/login?email=${event.request.userAttributes.email}">click this link to login.</a><p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
                }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        }).promise();

        //send admin user signup message
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: ['chris@place4pals.com'] },
            Message: {
                Subject: { Data: `place4pals event: ${event.request.userAttributes['custom:username']} just signed up` },
                Body: {
                    Html: { Data: formatEmailBody(`hey admin,<p>${event.request.userAttributes['custom:username']} just signed up!<p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
                }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        }).promise();

        return context.done(null, event);
    }
    else if (event.triggerSource === 'CustomMessage_SignUp') {
        event.response.emailSubject = `confirm your registration, ${event.request.userAttributes['custom:username']}!`;
        event.response.emailMessage = formatEmailBody(`hey!<p><a href="https://lambda.place4pals.com/public/confirm?username=${event.userName}&code=${event.request.codeParameter}&email=${event.request.userAttributes.email}">click this link to complete your registration.</a><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
        return context.done(null, event);
    }
    else if (event.triggerSource === 'CustomMessage_UpdateUserAttribute') {
        let pool = new Pool(poolConfig);
        let code = aws.util.uuid.v4();
        console.log(code, event.userName);
        await pool.query(`UPDATE users SET code='${code}' WHERE id='${event.userName}' `);

        event.response.emailSubject = `confirm your new email address, ${event.request.userAttributes['custom:username']}!`;
        event.response.emailMessage = formatEmailBody(`hey!<p><a href="https://lambda.place4pals.com/public/verify?username=${event.userName}&code=${event.request.codeParameter}">click this link to confirm your new email address.</a><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes.email);
        return context.done(null, event);
    }
    else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        event.response.emailSubject = `reset your password, ${event.request.userAttributes['preferred_username']}`;
        event.response.emailMessage = formatEmailBody(`hey there, ${event.request.userAttributes['preferred_username']}!<p>we received a request to reset your password.</p><p><a href="https://app.p4p.io/set?email=${event.request.userAttributes.email}&code=${event.request.codeParameter}">click this link to set your new password.</a><p>if you did not request this, you can ignore this email.</p><p>thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`, event.request.userAttributes['email']);

        return context.done(null, event);
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmForgotPassword') {
        //send email letting user know someone reset their password
        aws.config.update({ region: 'us-east-1' });
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: [event.request.userAttributes['email']] },
            Message: {
                Body: {
                    Html: { Data: formatEmailBody(`hey there, ${event.request.userAttributes['custom:username']},<p>you've successfully changed your password! if you did not do this, we highly recommend changing your password immediately.</p><p><a href="https://app.p4p.io/reset?email=${event.request.userAttributes.email}">click this link to change your password again.</a><p>otherwise, you can ignore this email.</p><p>thanks,<br>place4pals`, event.request.userAttributes['email']) }
                },
                Subject: { Data: `alert: you changed your password, ${event.request.userAttributes['custom:username']}` }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        }).promise();
        return context.done(null, event);
    }

    if (event.path.startsWith('/public')) {
        if (event.path.endsWith('/reset')) {
            const cisp = new aws.CognitoIdentityServiceProvider();
            let response = await cisp.confirmForgotPassword({ ClientId: process.env.clientId, ConfirmationCode: event.queryStringParameters.code, Password: event.queryStringParameters.password, Username: event.queryStringParameters.username }).promise();
            console.log(response);
            return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': 'https://app.place4pals.com' } };
        }
        else if (event.path.endsWith('/confirm')) {
            const cisp = new aws.CognitoIdentityServiceProvider();
            let response = await cisp.confirmSignUp({ ClientId: process.env.clientId, ConfirmationCode: event.queryStringParameters.code, Username: event.queryStringParameters.username }).promise();
            console.log(response);
            return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': `https://app.place4pals.com/login?email=${event.queryStringParameters.email}` } };
        }
        else if (event.path.endsWith('/verify')) {
            const cisp = new aws.CognitoIdentityServiceProvider();

            let pool = new Pool(poolConfig);
            let response = await pool.query(`SELECT code FROM users WHERE id='${event.queryStringParameters.username}' `);

            if (response.rows[0].code !== event.queryStringParameters.code) {
                return { statusCode: 200, body: "sorry, the code you provided to verify your email address is invalid", headers: { 'Access-Control-Allow-Origin': '*' } };
            }
            else {
                try {
                    let response = await cisp.adminUpdateUserAttributes({
                        UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
                        UserPoolId: process.env.userPoolId,
                        Username: event.queryStringParameters.username

                    }).promise();
                    console.log(response);
                    return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': `https://app.place4pals.com` } };
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
        else if (event.path.endsWith('/test')) {
            return {
                statusCode: 200,
                body: JSON.stringify('hey there, pal!'),
                headers: { 'Access-Control-Allow-Origin': '*' }
            };
        }
    }
    else if (event.path.startsWith('/auth')) {

    }
    else if (event.path.startsWith('/test')) {
        aws.config.update({ region: 'us-east-1' });
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: ['chris@productabot.com'] },
            Message: {
                Subject: { Data: `Welcome to place4pals!` },
                Body: {
                    Html: { Data: formatEmailBody(`hey!<p><a href="https://app.p4p.io/login">click this link to login.</a><p>thanks,<br>place4pals`, 'chris@productabot.com') }
                }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        }).promise();
    }
    else {
        //we're redirecting to a user profile based on a given username
        let hostSplit = event.headers.Host.split('.');
        let pool = new Pool(poolConfig);
        let response = await pool.query('SELECT id FROM users WHERE username=$1', [hostSplit[0]]);
        let redirectDomain = event.headers.Host.split('.').slice(1).join('.');
        return { statusCode: 302, body: null, headers: { 'Access-Control-Allow-Origin': '*', 'Location': response.rows.length > 0 ? `https://app.${redirectDomain}/user/${response.rows[0].id}` : `https://app.${redirectDomain}` } };
    }
};
