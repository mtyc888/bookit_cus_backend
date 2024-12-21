const stripe = require('../config/stripeClient');

//onboarding users
const onboardUser = async (req, res) => {
    try {
        const { country, email, businessType, businessWebsite, externalAccount } = req.body;

        if (!country || !email || !externalAccount || !businessType || !businessWebsite) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Step 1: Create a connected account
        const account = await createConnectedAccount({ country, email, businessType, businessWebsite, externalAccount });

        // Step 2: Generate onboarding link
        const accountLink = await generateAccountLink(account.id);

        res.status(200).json({
            message: "Connected account created successfully. Complete onboarding.",
            account: account.id,
            accountLink: accountLink.url,
        });
    } catch (error) {
        console.error("Error during onboarding process:", error);
        res.status(500).json({ error: error.message });
    }
};

//Create a connected account
const createConnectedAccount = async ({ country, email, businessType, businessWebsite, externalAccount }) => {
    return await stripe.accounts.create({
        country: country || "MY",
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        business_type: businessType || "individual",
        settings: {
            payouts: {
                schedule: {
                    interval: "daily",
                },
            },
        },
        external_account: externalAccount,
        business_profile: {
            url: businessWebsite,
        },
    });
};

//Generate Onboarding Link
const generateAccountLink = async(accountId) =>{
    return await stripe.accountLinks.create({
        account: accountId,
        refresh_url: "https://example.com/reauth",
        return_url: "https://example.com/return",
        type: "account_onboarding",
    })

}

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

/*Stripe FPX*/

// Handle payments using FPX
const createPaymentIntentForFPX = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Create a PaymentIntent with FPX as the payment method
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Amount in cents
            currency: currency || 'myr', // FPX only supports MYR
            payment_method_types: ['fpx'], // Specify FPX as the payment method
        });

        res.status(200).json({
            message: 'FPX PaymentIntent created successfully',
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Error creating FPX PaymentIntent:', error);
        res.status(500).json({ error: error.message });
    }
};

//Confirm FPX payment programmically (FOR TESTING ONLY)
const confirmFpxPayment = async (req, res) => {
    const { paymentIntentId, bank } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method_data: {
                type: 'fpx',
                fpx: {
                    bank: bank || 'maybank2u', 
                },
            },
            return_url: 'https://example.com/success', 
        });

        res.status(200).json({
            message: 'FPX Payment confirmed successfully',
            paymentIntent,
        });
    } catch (error) {
        console.error('Error confirming FPX payment:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    onboardUser,
    attachDebitCard,
    createPaymentIntent,
    createPayout,
    createBankToken,
    createPaymentIntentForFPX,
    confirmFpxPayment
}