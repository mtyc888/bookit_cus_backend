const stripe = require('../config/stripeClient');

//onboarding users
const onboardUser = async (req, res) => {
    const { country, email, businessType, businessWebsite, externalAccount } = req.body;

    try {
        // Create a connected account with valid fields
        const account = await stripe.accounts.create({
            country: country || "MY", // Default to Malaysia
            email, // Add email for the account
            capabilities: {
                card_payments: { requested: true }, // Enable card payments
                transfers: { requested: true }, // Enable transfers
            },
            business_type: businessType || "individual", // Specify business type
            settings: {
                payouts: {
                    schedule: {
                        interval: "daily", // Automatically schedule payouts
                    },
                },
            },
            external_account: externalAccount, // Attach the external account
            business_profile: {
                url: businessWebsite, // Provide a business website
            },
        });

        // Generate an account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: "https://example.com/reauth", // URL to redirect if onboarding fails
            return_url: "https://example.com/return", // URL to redirect after onboarding
            type: "account_onboarding", // Onboarding link type
        });

        res.status(200).json({
            message: "Connected account created successfully. Complete onboarding.",
            account: account.id,
            accountLink: accountLink.url,
        });
    } catch (error) {
        console.error(
            "An error occurred when calling the Stripe API to create an account",
            error
        );
        res.status(500).json({ error: error.message });
    }
};


//Attach a debit card to a connected account
const attachDebitCard = async (req, res) => {
    try{
        const { accountId, cardToken } = req.body;
        const externalAccount = await stripe.accounts.createExternalAccount(
            accountId,
            {
                external_account: cardToken,
            }
        );
        res.status(200).json({
            message : "Debit card attached successfully",
            externalAccount,
        });
    } catch(error){
        console.error(error);
        res.status(500).json({ error : error.message });
    }
}

//Handle payments from customers
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency, connectedAccountId } = req.body;
        // Create a payment intent with Malaysian Ringgit as the default currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || 'myr', // Default to MYR
            payment_method_types: ['card'],
            transfer_data: {
                destination: connectedAccountId,
            },
        });

        res.status(200).json({
            message: "Payment Successful",
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
};


//Initiate an instant payout to the connected account's debit card
const createPayout = async (req, res) => {
    const { amount, connectedAccountId } = req.body;

    try {
        // Create a standard payout in MYR
        const payout = await stripe.payouts.create(
            {
                amount, // Amount in cents
                currency: "myr", // Ensure the currency is MYR
            },
            {
                stripe_account: connectedAccountId, // Specify the connected account
            }
        );

        res.status(200).json({
            message: "Standard payout created successfully",
            payout,
        });
    } catch (error) {
        console.error("An error occurred when creating a payout:", error);
        res.status(500).json({ error: error.message });
    }
};
const createBankToken = async (req, res) => {
    const { country, currency, account_holder_name, account_holder_type, account_number, routing_number } = req.body;

    try {
        const token = await stripe.tokens.create({
            bank_account: {
                country: country || 'MY', // Default to Malaysia
                currency: currency || 'myr', // Default to MYR
                account_holder_name,
                account_holder_type, // 'individual' or 'company'
                account_number, // Bank account number
                routing_number, // Routing number (required for MY)
            },
        });

        res.status(200).json({
            message: 'Bank token created successfully',
            token: token.id,
        });
    } catch (error) {
        console.error("Error creating bank token:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    onboardUser,
    attachDebitCard,
    createPaymentIntent,
    createPayout,
    createBankToken
}