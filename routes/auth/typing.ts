import { query } from "../../utils/query";

export const typing = async ({ event }) => {
    if (event.httpMethod === 'POST') {
        await query(`UPDATE "place4pals" SET "typing"=set_add("typing",<<'${event?.requestContext?.authorizer?.claims?.preferred_username}'>>) WHERE "parent_id"='post' AND "id"='post#${event.body.postId}'`);

        return true;
    }
    else if (event.httpMethod === 'DELETE') {
        await query(`UPDATE "place4pals" SET "typing"=set_delete("typing",<<'${event?.requestContext?.authorizer?.claims?.preferred_username}'>>) WHERE "parent_id"='post' AND "id"='post#${event.body.postId}'`);

        return true;
    }
}