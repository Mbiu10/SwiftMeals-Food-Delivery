import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Object, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  payment: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ["cash", "mpesa"], default: "mpesa" },
  mpesa: {
    CheckoutRequestID: { type: String },
    MpesaReceiptNumber: { type: String },
    TransactionDate: { type: Number },
    PhoneNumber: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", OrderSchema);