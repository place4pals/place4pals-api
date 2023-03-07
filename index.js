import { cognitoRouter } from './routers/cognitoRouter';
import { publicRouter } from './routers/publicRouter';
import { hasuraRouter } from './routers/hasuraRouter';
import { authRouter } from './routers/authRouter';
import { websiteRouter } from './routers/websiteRouter';

import pg from 'pg';
const pool = new pg.Pool({ min: 0, max: 1, idle: 1000, connectionString: process.env.connectionString });

export const handler = async (event) => {
    console.log("place4pals-api init", JSON.stringify(event));
    event.body ? event.body = JSON.parse(event.body) : null;

    if (event.triggerSource) {
        return cognitoRouter({ event, pool });
    }
    else if (event.path.startsWith('/public')) {
        return publicRouter({ event, pool });
    }
    else if (event.path.endsWith('/hasura')) {
        return hasuraRouter({ event, pool });
    }
    else if (event.path.startsWith('/auth')) {
        return authRouter({ event, pool });
    }
    else {
        return websiteRouter({ event, pool });
    }
};
