import { reset } from "../routes/public/reset";
import { confirm } from "../routes/public/confirm";
import { verify } from "../routes/public/verify";
import { unsubscribe } from "../routes/public/unsubscribe";
import { internetTest } from "../routes/public/internetTest";
import { test } from "../routes/public/test";
import { dynamoTest } from "../routes/public/dynamoTest";
import { posts } from "../routes/auth/posts";
import { users } from "../routes/auth/users";
import { pools } from "../routes/auth/pools";

export const publicRouter = async ({ event, pool }) => {
    if (event.path.endsWith('/reset')) {
        return reset({ event, pool });
    }
    else if (event.path.endsWith('/confirm')) {
        return confirm({ event, pool });
    }
    else if (event.path.endsWith('/verify')) {
        return verify({ event, pool });
    }
    else if (event.path.endsWith('/unsubscribe')) {
        return unsubscribe({ event, pool });
    }
    else if (event.path.endsWith('/internetTest')) {
        return internetTest({ event, pool });
    }
    else if (event.path.endsWith('/test')) {
        return test({ event, pool });
    }
    else if (event.path.endsWith('/dynamoTest')) {
        return dynamoTest({ event, pool });
    }
    else if (event.path.endsWith('/posts')) {
        return posts({ event });
    }
    else if (event.path.endsWith('/users')) {
        return users({ event });
    }
    else if (event.path.endsWith('/pools')) {
        return pools({ event });
    }
}