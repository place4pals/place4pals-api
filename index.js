const aws = require('aws-sdk');
const { Pool } = require('pg');
const poolConfig = {
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
};

exports.handler = async(event, context) => {
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
        let users = await cisp.listUsers({
            UserPoolId: process.env.userPoolId,
            AttributesToGet: ['email'],
            Filter: `preferred_username = "${event.request.userAttributes['custom:username']}"`,
            Limit: '1'
        }).promise();
        if (users.Users.length === 0) {
            event.response.autoConfirmUser = true;
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
        let emailSubject = `Welcome to place4pals, ${event.request.userAttributes['custom:username']}!`;
        let emailBody = `Hey there, ${event.request.userAttributes['custom:username']}!<p><a href="https://app.p4p.io/login?email=${event.request.email}">Click this link to login.</a><p>Thanks,<br>place4pals`;
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: [event.request.userAttributes['email']] },
            Message: {
                Body: {
                    Html: { Charset: "UTF-8", Data: emailBody },
                    Text: { Charset: "UTF-8", Data: emailBody }
                },
                Subject: { Charset: 'UTF-8', Data: emailSubject }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        }).promise();

        return context.done(null, event);
    }
    // else if (event.triggerSource === 'CustomMessage_SignUp') {
    //     event.response.emailSubject = `Confirm your registration, ${event.request.userAttributes['custom:username']}!`;
    //     event.response.emailMessage = `Hey!<p><a href="https://lambda.place4pals.com/public/confirm?username=${event.userName}&code=${event.request.codeParameter}&email=${event.request.email}">Click this link to complete your registration.</a><p>Thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`;
    //     return context.done(null, event);
    // }
    else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        event.response.emailSubject = `Reset your password, ${event.request.userAttributes['preferred_username']}`;
        event.response.emailMessage = `Hey there, ${event.request.userAttributes['preferred_username']}!<p>We received a request to reset your password.</p><p><a href="https://app.p4p.io/set?email=${event.request.userAttributes.email}&code=${event.request.codeParameter}">Click this link to set your new password.</a><p>If you did not request this, you can ignore this email.</p><p>Thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`;

        return context.done(null, event);
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmForgotPassword') {
        //send email letting user know someone reset their password
        aws.config.update({ region: 'us-east-1' });
        let emailSubject = `Alert: You changed your password, ${event.request.userAttributes['custom:username']}`;
        let emailBody = `Hey there, ${event.request.userAttributes['custom:username']},<p>You've successfully changed your password! If you did not do this, we highly recommend changing your password immediately.</p><p><a href="https://app.p4p.io/reset?email=${event.request.userAttributes.email}">Click this link to change your password again.</a><p>Otherwise, you can ignore this email.</p><p>Thanks,<br>place4pals`;
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: [event.request.userAttributes['email']] },
            Message: {
                Body: {
                    Html: { Charset: "UTF-8", Data: emailBody },
                    Text: { Charset: "UTF-8", Data: emailBody }
                },
                Subject: { Charset: 'UTF-8', Data: emailSubject }
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
        else if (event.path.endsWith('/test')) {
            return {
                statusCode: 200,
                body: JSON.stringify('hey there, pal'),
                headers: { 'Access-Control-Allow-Origin': '*' }
            };
        }
    }
    else if (event.path.startsWith('/auth')) {

    }
    else if (event.path.startsWith('/test')) {
        aws.config.update({ region: 'us-east-1' });
        let emailSubject = `Welcome to place4pals!`;
        let emailBody = `Hey!<p><a href="https://app.p4p.io/login">Click this link to login.</a><p>Thanks,<br>place4pals`;
        await new aws.SES().sendEmail({
            Destination: { ToAddresses: ['chris@productabot.com'] },
            Message: {
                Body: {
                    Html: { Charset: "UTF-8", Data: emailBody },
                    Text: { Charset: "UTF-8", Data: emailBody }
                },
                Subject: { Charset: 'UTF-8', Data: emailSubject }
            },
            Source: 'place4pals <noreply@place4pals.com>',
            ReplyToAddresses: ['place4pals <noreply@place4pals.com>']
        }).promise();
    }
};
