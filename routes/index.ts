import { router, event, setEvent } from '#src/utils';
import * as authRoutes from "./auth";
import { customMessageForgotPassword, customMessageSignUp, customMessageUpdateUserAttribute, postConfirmationConfirmForgotPassword, postConfirmationConfirmSignUp, preSignUpSignUp, tokenGeneration } from "./cognito";
import * as internalRoutes from "./internal";
import * as publicRoutes from "./public";
import * as scheduledRoutes from "./scheduled";
import { CognitoJwtVerifier } from "aws-jwt-verify";
const verifier = CognitoJwtVerifier.create({ userPoolId: process.env.userPoolId, tokenUse: "id", clientId: process.env.clientId });

export const authRouter = async () => {
    try {
        const claims = await verifier.verify(event.headers.authorization.replace('Bearer ', ''));
        setEvent({ ...event, claims });
        return router(authRoutes);
    }
    catch (err) {
        console.log(err);
        return "Your authorization token is invalid";
    }
}

export const cognitoRouter = async () => {
    if (event.triggerSource === "PreSignUp_SignUp") {
        return preSignUpSignUp();
    }
    else if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
        return postConfirmationConfirmSignUp();
    }
    else if (event.triggerSource === "CustomMessage_SignUp") {
        return customMessageSignUp();
    }
    else if (event.triggerSource === "CustomMessage_UpdateUserAttribute") {
        return customMessageUpdateUserAttribute();
    }
    else if (event.triggerSource === "CustomMessage_ForgotPassword") {
        return customMessageForgotPassword();
    }
    else if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") {
        return postConfirmationConfirmForgotPassword();
    }
    else if (['TokenGeneration_Authentication', 'TokenGeneration_RefreshTokens', 'TokenGeneration_AuthenticateDevice'].includes(event.triggerSource)) {
        return tokenGeneration();
    }
}

export const internalRouter = async () => {
    return router(internalRoutes);
}

export const publicRouter = async () => {
    return router(publicRoutes);
}

export const scheduledRouter = async () => {
    return router(scheduledRoutes);
}