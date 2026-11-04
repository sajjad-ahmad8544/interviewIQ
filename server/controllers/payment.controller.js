import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto"

// Plans are defined on the server so the client can't tamper with price/credits.
const PLANS = {
    basic: { amount: 100, credits: 150 },
    pro: { amount: 500, credits: 650 },
};

export const createOrder = async (req,res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({ message: "Payments are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env" });
        }
        const { planId } = req.body;
        const plan = PLANS[planId];
        if (!plan) {
      return res.status(400).json({ message: "Invalid plan" });
    }
    const { amount, credits } = plan;

     const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options)

     await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json(order);

    
    } catch (error) {
         return res.status(500).json({message:`failed to create Razorpay order ${error}`})
    }
}


export const verifyPayment = async (req,res) => {
    try {
        const {razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature} = req.body

      const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

     const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.userId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      const existingUser = await User.findById(payment.userId);
      return res.json({ success: true, message: "Already processed", user: existingUser });
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(payment.userId, {
      $inc: { credits: payment.credits }
    },{new:true});

    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });

    } catch (error) {
         return res.status(500).json({message:`failed to verify Razorpay payment ${error}`})
    }
}