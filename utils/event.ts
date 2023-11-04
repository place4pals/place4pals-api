export let event = {
    httpMethod: '',
    path: '',
    queryStringParameters: {},
    body: {},
    requestContext: {},
};

export const setEvent = (rawEvent) => {
    console.log(rawEvent);

    try {
        rawEvent.body ? rawEvent.body = JSON.parse(rawEvent.body) : null;
        rawEvent.rawPath ? rawEvent.path = rawEvent.rawPath : null;
        !rawEvent.httpMethod ? rawEvent.httpMethod = rawEvent.requestContext?.http?.method : null;
    }
    catch { }

    event = rawEvent;
    return event;
}