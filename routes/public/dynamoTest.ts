export const dynamoTest = async ({ event, pool }) => {
    return {
        statusCode: 200,
        body: "dynamodb test",
        headers: { 'Access-Control-Allow-Origin': '*' }
    };
}