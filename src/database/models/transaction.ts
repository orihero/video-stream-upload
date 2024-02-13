import { TransactionStates } from "@enums/transaction.enums";
import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
      required: true,
    },
    state: {
      type: Number,
      enum: Object.values(TransactionStates),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    create_time: {
      type: Number,
      default: Date.now(),
    },
    perform_time: {
      type: Number,
      default: 0,
    },
    cancel_time: {
      type: Number,
      default: 0,
    },
    reason: {
      type: Number,
      default: null,
    },
    paycom_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = model("Transaction", transactionSchema);
