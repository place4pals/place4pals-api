export const tokenGeneration = async ({ event }) => {
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