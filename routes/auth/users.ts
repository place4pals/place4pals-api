import { query } from "../../utils/query";

export const users = async ({ event }) => {
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
};
