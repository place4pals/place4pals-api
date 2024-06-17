import { cognitoRouter, publicRouter, authRouter, internalRouter, scheduledRouter } from "#src/routes";
import { apiEvent, apiResponse } from "./types";
import { setEvent } from "#src/utils";

export const handler = async (rawEvent: apiEvent): Promise<apiResponse> => {
  console.log("place4pals-api init");
  const event = setEvent(rawEvent);

  if (event.triggerSource) {
    return cognitoRouter();
  }
  else if (event.path.startsWith("/public")) {
    return publicRouter();
  }
  else if (event.path.startsWith("/auth")) {
    return authRouter();
  }
  else if (event.path.startsWith("/internal")) {
    return internalRouter();
  }
  else if (event.path.startsWith("/scheduled")) {
    return scheduledRouter();
  }
};
