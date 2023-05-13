import { query } from "../../utils/query";

export const pools = async ({ event }) => {
  if (event.httpMethod === "GET") {
    const response = await query(
      `SELECT * FROM "place4pals" WHERE "parent_id"='pool' AND begins_with("id",'pool#') ORDER BY "id" ASC`
    );

    return response;
  }
};
