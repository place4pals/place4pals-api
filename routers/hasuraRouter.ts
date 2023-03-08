import { commentNotifications } from "../routes/hasura/commentNotifications";

export const hasuraRouter = async ({ event, pool }) => {
    if (event.body.event.data.new) {
        return commentNotifications({ event, pool });
    }
}