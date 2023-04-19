import { query } from "../../utils/query";
import { generateId, getId, idToDate, idToOrder } from "../../utils/ksuid";

export const comments = async ({ event }) => {
  const userId = event?.requestContext?.authorizer?.claims?.profile ?? process.env.mainDynamoDbUserId;
  if (event.httpMethod === 'POST') {
    await query(`INSERT INTO "place4pals" VALUE {
        'parent_id':?, 
        'id':'comment#${generateId()}', 
        'user_id':'user#${userId}',
        'content':?
    }`, null, [{ S: `post#${event.body.postId}` }, { S: event.body.content }]);

    return {
      statusCode: 200,
      body: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
  else if (event.httpMethod === 'DELETE') {
    await query(`DELETE FROM "place4pals" WHERE "parent_id"='post#${event.body.postId}' AND "id"='comment#${event.body.commentId}'`);

    return {
      statusCode: 200,
      body: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};
