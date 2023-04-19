import { query } from "../../utils/query";
import { generateId, getId, idToDate, idToOrder } from "../../utils/ksuid";
import { S3 } from "@aws-sdk/client-s3";
const s3 = new S3();

export const posts = async ({ event }) => {
  const userId = event?.requestContext?.authorizer?.claims?.profile ?? process.env.mainDynamoDbUserId;
  if (event.httpMethod === "GET") {
    const users = [];

    // Grab all posts in the default pool
    const posts = await query(
      event.queryStringParameters?.id
        ? `SELECT * FROM "place4pals" WHERE "parent_id"='post' AND "id"='post#${event.queryStringParameters.id}'`
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
        await query(`SELECT "id", "name", "media" FROM "place4pals" WHERE "parent_id"='user' AND "id" IN (
            ${[...new Set(users)].map((user_id) => `'${user_id}'`).join(",")}
            )`)
      ).map(({ id, name, media }) => [id, { name, media }])
    );

    const response = posts.map((post) => ({
      id: getId(post.id),
      date: idToDate(post.id),
      name: post.name,
      content: post.content,
      user: {
        id: getId(post.user_id),
        name: userDictionary[post.user_id].name,
        media: userDictionary[post.user_id].media,
      },
      typing: Array.from(post.typing ?? []),
      media: post.media,
      comments: post.comments
        .filter(({ parent_comment_id }) => !parent_comment_id)
        .map((comment) => ({
          id: getId(comment.id),
          date: idToDate(comment.id),
          content: comment.content,
          user: {
            id: getId(comment.user_id),
            name: userDictionary[comment.user_id].name,
            media: userDictionary[comment.user_id].media,
          },
          comments: post.comments
            .filter(({ parent_comment_id }) => comment.id === parent_comment_id)
            .map((comment) => ({
              id: getId(comment.id),
              date: idToDate(comment.id),
              content: comment.content,
              user: {
                id: getId(comment.user_id),
                name: userDictionary[comment.user_id].name,
                media: userDictionary[comment.user_id].media,
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
                    name: userDictionary[comment.user_id].name,
                    media: userDictionary[comment.user_id].media,
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
    let mediaId = null;
    if (event.body.mediaBase64) {
      mediaId = generateId();
      await s3.putObject({
        Bucket: `p4p-prod-files`,
        Key: `public/${mediaId}`,
        ContentEncoding: 'base64',
        ContentType: event.body.mediaContentType,
        Body: Buffer.from(event.body.mediaBase64.replace(/^data:.+;base64,/, ""), 'base64'),
      });
    }

    await query(`INSERT INTO "place4pals" VALUE {
        'parent_id':'post', 
        'id':'post#${generateId()}', 
        'user_id':'user#${userId}',
        'pool_id':'pool#0',
        'name':?,
        'content':?,
        'media':?
    }`, null, [{ S: event.body.title }, { S: event.body.content }, { S: mediaId }]);

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
