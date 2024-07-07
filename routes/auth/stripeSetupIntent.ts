import { event, stripe } from "#src/utils";

export const stripeSetupIntent = async () => {
    const intent = await stripe.setupIntents.create({ customer: event.claims.profile });

    return { client_secret: intent.client_secret };
}