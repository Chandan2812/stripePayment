const express = require("express")
const mongoose = require('mongoose')
const paymentRouter = express.Router();
require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const {PaymentIntentModel} = require('../models/payment.model');
  

// POST: Create Intent for Payment
paymentRouter.post('/create_intent', async (req, res) => {
  try {
      const { amount, currency } = req.body;

      // Create the PaymentIntent on Stripe without immediate confirmation
      const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          capture_method: 'manual',
          description: 'Description of the product or service',
          payment_method_data: {
              type: 'card',
              card: {
                  token: 'tok_visa',
              }
          },
          automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'never'
          }
      });

      // Store the PaymentIntent data in MongoDB
      const dbPaymentIntent = new PaymentIntentModel({
          stripeId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
      });
      await dbPaymentIntent.save();

      res.status(201).json(paymentIntent);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});





paymentRouter.post('/capture_intent/:id', async (req, res) => {
    try {
        const intentId = req.params.id;

        // Confirm the PaymentIntent
        const confirmedIntent = await stripe.paymentIntents.confirm(intentId);

        if(confirmedIntent.status === 'requires_capture') {
            // Capture the confirmed PaymentIntent
            const capturedIntent = await stripe.paymentIntents.capture(intentId);

            // Update the status in MongoDB
            const updatedPaymentIntent = await PaymentIntentModel.findOneAndUpdate(
                { stripeId: intentId },
                { status: capturedIntent.status },
                { new: true }
            );

            res.status(200).json(updatedPaymentIntent);
        } else {
            throw new Error("PaymentIntent cannot be captured in its current state.");
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = {paymentRouter};
