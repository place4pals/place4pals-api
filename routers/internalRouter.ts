import { testEmail } from "../routes/internal/testEmail";

export const internalRouter = async ({ event }) => {
    if (event.path.endsWith('/testEmail')) {
        return testEmail({ event });
    }
}