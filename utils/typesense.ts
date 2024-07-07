import Typesense from 'typesense'
import { isStaging } from './isStaging';

export const typesense = new Typesense.Client({
    nodes: [
        {
            host: `search${isStaging ? '-staging' : ''}.place4pals.com`,
            port: 443,
            protocol: "https",
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
    numRetries: 3,
    connectionTimeoutSeconds: 10,
});