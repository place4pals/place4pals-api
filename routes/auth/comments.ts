import { query } from "../../utils/query";
import { generateId } from "../../utils/ksuid";

export const comments = async ({ event }) => {
  const userId = event?.claims?.profile;
  if (event.httpMethod === 'POST') {
    await query(`INSERT INTO "place4pals" VALUE {
        'parent_id':?, 
        'id':'comment#${generateId()}', 
        'user_id':'user#${userId}',
        'content':?
    }`, null, [{ S: `post#${event.body.postId}` }, { S: event.body.content }]);

    return true;
  }
  else if (event.httpMethod === 'DELETE') {
    await query(`DELETE FROM "place4pals" WHERE "parent_id"='post#${event.body.postId}' AND "id"='comment#${event.body.commentId}'`);

    return true;
  }
};
