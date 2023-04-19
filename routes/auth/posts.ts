import { query } from "../../utils/query";
import { generateId, getId, idToDate, idToOrder } from "../../utils/ksuid";

export const posts = async ({ event }) => {
  const userId = event?.requestContext?.authorizer?.claims?.profile ?? process.env.mainDynamoDbUserId;
  if (event.httpMethod === "GET") {
    const users = [];

    // Grab all posts in the default pool
    const posts = await query(
      event.queryStringParameters?.id
        ? `SELECT * FROM "place4pals" WHERE "parent_id"='user' AND "id"='post#${event.queryStringParameters.id}'`
        : `SELECT * FROM "place4pals"."pool_id" WHERE "pool_id"='pool#0' AND begins_with("id",'post#') ORDER BY "id" DESC`,
      100
    );
    users.push(...posts.map(({ user_id }) => user_id));

    // Grab all comments for each post
    await Promise.all(
      posts.map(async (post) => {
        const comments = await query(
          `SELECT * FROM "place4pals" WHERE "parent_id"='${post.id}' AND begins_with("id",'comment#') ORDER BY "id" ASC`
        );
        post.comments = comments;
        users.push(...comments.map(({ user_id }) => user_id));
      })
    );

    // Perform joins for all usernames
    const userDictionary = Object.fromEntries(
      (
        await query(`SELECT "id", "name" FROM "place4pals" WHERE "parent_id"='user' AND "id" IN (
            ${[...new Set(users)].map((user_id) => `'${user_id}'`).join(",")}
            )`)
      ).map(({ id, name }) => [id, name])
    );

    const response = posts.map((post) => ({
      id: getId(post.id),
      date: idToDate(post.id),
      name: post.name,
      content: post.content,
      user: {
        id: getId(post.user_id),
        name: userDictionary[post.user_id],
      },
      typing: Array.from(post.typing ?? []),
      comments: post.comments
        .filter(({ parent_comment_id }) => !parent_comment_id)
        .map((comment) => ({
          id: getId(comment.id),
          date: idToDate(comment.id),
          content: comment.content,
          user: {
            id: getId(comment.user_id),
            name: userDictionary[comment.user_id],
          },
          comments: post.comments
            .filter(({ parent_comment_id }) => comment.id === parent_comment_id)
            .map((comment) => ({
              id: getId(comment.id),
              date: idToDate(comment.id),
              content: comment.content,
              user: {
                id: getId(comment.user_id),
                name: userDictionary[comment.user_id],
              },
              comments: post.comments
                .filter(
                  ({ parent_comment_id }) => comment.id === parent_comment_id
                )
                .map((comment) => ({
                  id: getId(comment.id),
                  date: idToDate(comment.id),
                  content: comment.content,
                  user: {
                    id: getId(comment.user_id),
                    name: userDictionary[comment.user_id],
                  },
                })),
            })),
        })),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
  else if (event.httpMethod === 'POST') {
    await query(`INSERT INTO "place4pals" VALUE {
        'parent_id':'post', 
        'id':'post#${generateId()}', 
        'user_id':'user#${userId}',
        'pool_id':'pool#0',
        'name':?,
        'content':?
    }`, null, [{ S: event.body.title }, { S: event.body.content }]);

    return {
      statusCode: 200,
      body: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
  else if (event.httpMethod === 'DELETE') {
    await query(`DELETE FROM "place4pals" WHERE "parent_id"='post' AND "id"='post#${event.body.id}'`);

    return {
      statusCode: 200,
      body: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};
