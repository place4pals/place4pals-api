import { posts } from "../routes/auth/posts";
import { users } from "../routes/auth/users";
import { pools } from "../routes/auth/pools";

export const publicRouter = async ({ event }) => {
    if (event.path.endsWith('/posts')) {
        return posts({ event });
    }
    else if (event.path.endsWith('/users')) {
        return users({ event });
    }
    else if (event.path.endsWith('/pools')) {
        return pools({ event });
    }
}