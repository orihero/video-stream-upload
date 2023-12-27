import mongoose from "mongoose";

const DB_CONNECTION_STRING =
  "mongodb+srv://orihero:asdf12345@cluster0.tctdcie.mongodb.net/tutor?retryWrites=true&w=majority";

export const initDatabase = async () => {
  try {
    let res = await mongoose.connect(DB_CONNECTION_STRING);
  } catch (error) {
    throw Error("Failed to establish connection database");
  }
};
