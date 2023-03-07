export const internetTest = async ({ event, pool }) => {
    const response = await (await fetch('https://api.htic.io/test')).text();

    return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: { 'Access-Control-Allow-Origin': '*' }
    };
}