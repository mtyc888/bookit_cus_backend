const express = require('express');
const router = express.Router();
const { onboardUser, attachDebitCard, createPaymentIntent, createPayout, createBankToken, createPaymentIntentForFPX, confirmFpxPayment } = require('../controllers/stripeController.js');

// Route to onboard a user (create a connected account)
router.post('/stripe/connect', onboardUser);

// Route to attach a debit card
router.post('/stripe/attach-card', attachDebitCard);

// Route to create a payment intent
router.post('/stripe/payment-intent', createPaymentIntent);

// Route to create a payout
router.post('/stripe/payout', createPayout);

// Route to generate test bank token
router.post('/stripe/create-bank-token', createBankToken);

// Route to create a PaymentIntent for FPX
router.post('/stripe/payment-intent/fpx', createPaymentIntentForFPX);

// Route to confirm FPX payment (TESTING ONLY)
router.post('/stripe/confirm-payment', confirmFpxPayment);
module.exports = router;
