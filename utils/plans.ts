const basePlans = {
    basic: {
        name: 'basic',
        price: 0.99,
    },
    pro: {
        name: 'Pro',
        price: 24.99,
    },
    enterprise: {
        name: 'Enterprise',
        price: 99.99,
    },
};

export const plansStaging = {
    basic: {
        ...basePlans.basic,
        product_id: '',
        price_id: '',
    },
    pro: {
        ...basePlans.pro,
        product_id: '',
        price_id: '',
    },
    enterprise: {
        ...basePlans.enterprise,
        product_id: '',
        price_id: '',
    }
};

export const plansProd = {
    basic: {
        ...basePlans.basic,
        product_id: '',
        price_id: '',
    },
    pro: {
        ...basePlans.pro,
        product_id: '',
        price_id: '',
    },
    enterprise: {
        ...basePlans.enterprise,
        product_id: '',
        price_id: '',
    }
};

export const plans = process.env.STAGING ? plansStaging : plansProd;