import dotenv from "dotenv";
dotenv.config();

export const environments = {
  PORT: process.env.PORT || 7400,
  MONGO_URI: process.env.MONGO_URI || "",
  PAYME_MERCHANT_KEY: process.env.PAYME_MERCHANT_KEY,
};
