import { query } from "../../utils/query";
import { generateId } from "../../utils/ksuid";
import { S3 } from "@aws-sdk/client-s3";
const s3 = new S3();

export const users = async ({ event }) => {
  const userId = event?.claims?.profile;
  if (event.httpMethod === "GET") {
    const response = await query(
      event.queryStringParameters?.id
        ? `SELECT * FROM "place4pals" WHERE "parent_id"='user' AND "user_id"='user#${event.queryStringParameters.id}' ORDER BY "id" ASC`
        : `SELECT * FROM "place4pals" WHERE "parent_id"='user' AND begins_with("id",'user#') ORDER BY "id" ASC`
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
  else if (event.httpMethod === 'PUT') {
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
    await query(`UPDATE "place4pals" SET "media"='${mediaId}' WHERE "parent_id"='user' AND "id"='user#${userId}'`);
    
    return {
      statusCode: 200,
      body: true,
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};
