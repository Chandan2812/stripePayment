const express=require("express");
const cors=require("cors")
const {Connection} = require('./config/db')
const {paymentRouter} = require("./routes/payment.route")
require('dotenv').config();

const app=express();

const PORT=process.env.PORT || 8000
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(cors())
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello from stripe payment app");
})

app.use("/api/v1",paymentRouter)

app.listen(PORT, async () => {
	try {
		await Connection;
		console.log("Connected to DB");
	} catch (error) {
		console.log(error.message);
	}
	console.log(`Server running @ ${PORT}`);
});