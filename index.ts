import { cognitoRouter } from "./routers/cognitoRouter";
import { publicRouter } from "./routers/publicRouter";
import { authRouter } from "./routers/authRouter";
import { internalRouter } from "./routers/internalRouter";

import { apiEvent, apiResponse } from "./types";

export const handler = async (event: apiEvent): Promise<apiResponse> => {
  console.log("place4pals-api init", JSON.stringify(event));
  event.body ? (event.body = JSON.parse(event.body)) : null;

  if (event.triggerSource) {
    return cognitoRouter({ event });
  }
  else if (event.path.startsWith("/public")) {
    return publicRouter({ event });
  }
  else if (event.path.startsWith("/auth")) {
    return authRouter({ event });
  }
  else if (event.path.startsWith("/internal")) {
    return internalRouter({ event });
  }
};
