import { generateId } from "../../utils/ksuid";

export const ksuid = async ({ }) => {
    return {
        statusCode: 200,
        body: generateId(),
        headers: { "Access-Control-Allow-Origin": "*" },
    };
}