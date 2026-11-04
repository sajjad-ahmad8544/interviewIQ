import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured =
  keyId && keySecret && !keyId.startsWith("add") && !keySecret.startsWith("add");

// Razorpay constructor throws if keys are missing, which would crash the
// whole server at startup. Create the instance only when keys are real.
const razorpay = isConfigured
  ? new Razorpay({ key_id: keyId, key_secret: keySecret })
  : null;

export default razorpay;
