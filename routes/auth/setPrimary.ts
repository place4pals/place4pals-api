import { cognito, event, stripe } from "#src/utils";

export const setPrimary = async () => {
    await cognito.adminUpdateUserAttributes({
        UserAttributes: [{ Name: 'website', Value: event.body.payment_method_id }],
        UserPoolId: process.env.USER_POOL_ID,
        Username: event.claims['cognito:username']
    });
    await stripe.customers.update(
        event.claims.profile, {
        invoice_settings: { default_payment_method: event.body.payment_method_id }
    });
    return;
}   