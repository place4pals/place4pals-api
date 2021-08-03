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
            }],
            UserPoolId: process.env.userPoolId,
            Username: event.userName
        }).promise();

        return context.done(null, event);
    }
    else if (event.triggerSource === 'CustomMessage_SignUp') {
        event.response.emailSubject = `Confirm your registration, ${event.request.userAttributes['custom:username']}!`;
        event.response.emailMessage = `Hey!<p><a href="https://lambda.place4pals.com/public/confirm?username=${event.userName}&code=${event.request.codeParameter}&email=${event.request.email}">Click this link to complete your registration.</a><p>Thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`;

        return context.done(null, event);
    }
    else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        event.response.emailSubject = `Reset your password, ${event.request.userAttributes['preferred_username']}!`;
        event.response.emailMessage = `Hey!<p><a href="https://app.place4pals.com/reset?username=${event.userName}&code=${event.request.codeParameter}&email=${event.request.email}">Click this link to reset your password.</a><p>Thanks,<br>place4pals<div style="display:none"><a>${event.request.codeParameter}</a><a>${event.request.codeParameter}</a></div>`;

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
};
