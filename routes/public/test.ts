export const test = async ({ event, pool }) => {
    return {
        statusCode: 200,
        body: "test received!!",
        headers: { 'Access-Control-Allow-Origin': '*' }
    };
}