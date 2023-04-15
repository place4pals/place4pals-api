import { pools } from "../routes/auth/pools";
import { posts } from "../routes/auth/posts";
import { users } from "../routes/auth/users";

export const authRouter = async ({ event, pool }) => {
    if (event.path.endsWith('/pools')) {
        return pools({ event });
    }
    else if (event.path.endsWith('/posts')) {
        return posts({ event });
    }
    else if (event.path.endsWith('/users')) {
        return users({ event });
    }
}