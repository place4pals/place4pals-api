export const unsubscribe = async ({ event, pool }) => {
    return {
        statusCode: 200,
        body: `${event.queryStringParameters.email} is now unsubscribed!`,
        headers: { 'Access-Control-Allow-Origin': '*' }
    };
}