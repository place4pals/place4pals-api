import { website } from "../routes/website/website";

export const websiteRouter = async ({ event, pool }) => {
    return website({ event, pool });
}