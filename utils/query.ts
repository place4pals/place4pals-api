import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
const dynamodb = new DynamoDB();

export const query = async (Statement, Limit = null, Parameters = null) => {
  return (
    await dynamodb.executeStatement({ Statement, Parameters, Limit })
  ).Items.map((obj) => unmarshall(obj));
};
