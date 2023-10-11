const express = require("express")
const mongoose = require('mongoose')
const paymentRouter = express.Router();
require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const {PaymentIntentModel} = require('../models/payment.model');
  
paymentRouter.post('/create_intent', async (req, res) => {
  try {
      const { amount, currency } = req.body;

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

        const confirmedIntent = await stripe.paymentIntents.confirm(intentId);

        if (confirmedIntent.status === 'requires_capture') {
            const capturedIntent = await stripe.paymentIntents.capture(intentId);
            res.status(200).json(capturedIntent);
        } else {
            res.status(200).json(confirmedIntent);
        }

        await PaymentIntentModel.findOneAndUpdate(
            { stripeId: intentId },
            { status: confirmedIntent.status },
            { new: true }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




paymentRouter.get('/get_intents', async (req, res) => {
    try {

        const paymentIntents = await stripe.paymentIntents.list();

        res.status(200).json(paymentIntents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = {paymentRouter};
