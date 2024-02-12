import { environments } from "@config/environment";
import mongoose from "mongoose";

export const initDatabase = async () => {
  try {
    let res = await mongoose.connect(environments.MONGO_URI);
  } catch (error) {
    throw Error("Failed to establish connection database");
  }
};
