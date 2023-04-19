import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  PreTokenGenerationAuthenticationTriggerEvent,
  PreTokenGenerationRefreshTokensTriggerEvent,
  PreTokenGenerationAuthenticateDeviceTriggerEvent,
  PreSignUpTriggerEvent,
  PostConfirmationConfirmSignUpTriggerEvent,
  CustomMessageSignUpTriggerEvent,
  CustomMessageUpdateUserAttributeTriggerEvent,
  CustomMessageForgotPasswordTriggerEvent,
  PostConfirmationConfirmForgotPassword,
} from "aws-lambda";

export type cognitoEvent =
  | PreTokenGenerationAuthenticationTriggerEvent
  | PreTokenGenerationRefreshTokensTriggerEvent
  | PreTokenGenerationAuthenticateDeviceTriggerEvent
  | PreSignUpTriggerEvent
  | PostConfirmationConfirmSignUpTriggerEvent
  | CustomMessageSignUpTriggerEvent
  | CustomMessageUpdateUserAttributeTriggerEvent
  | CustomMessageForgotPasswordTriggerEvent
  | PostConfirmationConfirmForgotPassword;

export type apiEvent = APIGatewayProxyEvent & cognitoEvent;

export type apiResponse = APIGatewayProxyResult | any | undefined;

export type cognitoRouterInput = {
  event: cognitoEvent;
};
