import { event, isStaging } from '.';

export const graphql = async ({ query, variables = {} }) => {
    const Authorization = event?.headers?.authorization;
    const response = (await (await fetch(`https://graphql${isStaging ? '-staging' : ''}.place4pals.com/v1/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...Authorization ? { Authorization } : { 'x-hasura-admin-secret': process.env.DB_PASSWORD },
        },
        body: JSON.stringify({ query, variables }),
    })).json());
    if (!response?.data) {
        console.log(JSON.stringify({ graphqlError: response }));
    }
    return response?.data;
}