import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },  
    category: { type: String, required: true },
    description: { type: String }, 
    images: [{ type: String }],

    sizes: [
      {
        size: { type: String, enum: ["s", "m", "l"], required: true },
        price: { type: Number, required: true }
      }
    ],

    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model("Product", ProductSchema);
