const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
    stripeId: {
        type: String,
        required: true,
        unique: true, 
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const PaymentIntentModel = mongoose.model('PaymentIntent', paymentIntentSchema);

module.exports = {PaymentIntentModel}
