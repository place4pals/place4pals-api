import { event, stripe } from "#src/utils";

export const listInvoices = async () => {
    if (!event.claims.profile) {
        return [];
    }
    const invoices = await stripe.invoices.list({ customer: event.claims.profile, limit: 100 });
    const response = invoices.data.map(obj => {
        return ({
            date: new Date(obj.created * 1000).toLocaleDateString(),
            orderNumber: obj.number,
            amount: obj.amount_paid / 100,
            link: obj.invoice_pdf,
            plans: obj.lines.data[0]?.description ?? 'Subscription'
        });
    });
    return response.filter(obj => obj.orderNumber);
}