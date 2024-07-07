import { event, stripe } from "#src/utils";

export const listCards = async () => {
    if (!event.claims.profile) {
        return [];
    }
    const cards = await stripe.paymentMethods.list({
        customer: event.claims.profile,
        type: 'card',
        limit: 100
    });
    const response = cards.data.map(obj => {
        return ({
            brand: obj.card.brand,
            last4: obj.card.last4,
            expiration: obj.card.exp_month + '/' + obj.card.exp_year,
            id: obj.id,
            default: event.claims.website === obj.id ? true : false
        })
    });
    return response;
}