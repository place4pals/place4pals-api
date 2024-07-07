import { event, stripe } from "#src/utils";

export const deleteCard = async () => {
    const card = await stripe.paymentMethods.detach(event.body.payment_method_id);
    return card;
}