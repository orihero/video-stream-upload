import { model, Schema } from "mongoose";
import { IUser } from "./user";

export interface IOtp {
  phone: string;
  name?: string;
  otp: string;
  date: Date;
}

const otpSchema = new Schema<IOtp & IUser>({
  dateOfBirth: {
    type: String,
  },
  name: {
    type: String,
  },
  parentNumber: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  region: {
    type: String,
  },
  otp: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

export const OtpModel = model("Otp", otpSchema);
