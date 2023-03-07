import { tokenGeneration } from '../routes/cognito/tokenGeneration';
import { preSignUpSignUp } from '../routes/cognito/preSignUpSignUp';
import { postConfirmationConfirmSignUp } from '../routes/cognito/postConfirmationConfirmSignUp';
import { customMessageSignUp } from '../routes/cognito/customMessageSignUp';
import { customMessageUpdateUserAttribute } from '../routes/cognito/customMessageUpdateUserAttribute';
import { customMessageForgotPassword } from '../routes/cognito/customMessageForgotPassword';
import { postConfirmationConfirmForgotPassword } from '../routes/cognito/postConfirmationConfirmForgotPassword';

export const cognitoRouter = async ({ event, pool }) => {
    if (['TokenGeneration_Authentication', 'TokenGeneration_RefreshTokens', 'TokenGeneration_AuthenticateDevice'].includes(event.triggerSource)) {
        return tokenGeneration({ event });
    }
    else if (event.triggerSource === "PreSignUp_SignUp") {
        return preSignUpSignUp({ event });
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
        return postConfirmationConfirmSignUp({ event, pool });
    }
    else if (event.triggerSource === 'CustomMessage_SignUp') {
        return customMessageSignUp({ event });
    }
    else if (event.triggerSource === 'CustomMessage_UpdateUserAttribute') {
        return customMessageUpdateUserAttribute({ event });
    }
    else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        return customMessageForgotPassword({ event });
    }
    else if (event.triggerSource === 'PostConfirmation_ConfirmForgotPassword') {
        return postConfirmationConfirmForgotPassword({ event });
    }
}