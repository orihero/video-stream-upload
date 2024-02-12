import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export const ProductModel = model("Product", productSchema);
