import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: { type: String, enum: ["s", "m", "l"], required: true },
      quantity: { type: Number, default: 1 }
    }
  ]
});

export const CartModel= mongoose.model('Cart', cartSchema);
