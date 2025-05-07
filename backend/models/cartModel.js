import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartData: { type: Object, default: {} },
});

export default mongoose.model("Cart", CartSchema);