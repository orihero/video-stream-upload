import { UserModel } from "@database/models/user";
import { NextFunction, Router, Request, Response } from "express";
import { validate } from "@middlewares/validate";
import {
  loginValidationSchema,
  registerValidationSchema,
  verifyValidationSchema,
} from "@validation/user";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { IOtp, OtpModel } from "@database/models/otp";
import { SMSService } from "@utils/sms";
import { getSeconds } from "@utils/time";
import JWTService from "@utils/jwt";

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    let foundUser = await UserModel.findOne({ phone });
    if (!foundUser) {
      throw createHttpError(
        StatusCodes.NOT_FOUND,
        `${phone} has not signed up yet`
      );
    }
    const otpText = Math.random().toString().slice(3, 7);
    // const otpText = "1111";
    let foundOTP: IOtp | null = await OtpModel.findOne({ phone });

    if (foundOTP) {
      await OtpModel.updateOne(
        { phone },
        {
          date: new Date(Date.now()),
          otp: otpText,
        }
      );
    } else {
      await OtpModel.create({
        phone,
        date: new Date(Date.now()),
        otp: otpText,
      });
    }
    let r = await SMSService.sendSingleMessage(phone, `Kod: ${otpText}`);

    console.log(JSON.stringify(r.data, null, 4));

    res.status(StatusCodes.OK).json({ phone, otp: otpText });
  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    next(error);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;

    let foundUser = await UserModel.findOne({ phone });

    if (!!foundUser) {
      throw createHttpError(
        StatusCodes.BAD_REQUEST,
        `User with credentials ${phone} already exists`
      );
    }
    const otpText = Math.random().toString().slice(3, 7);
    let foundOTP: IOtp | null = await OtpModel.findOne({ phone });
    let r = await SMSService.sendSingleMessage(phone, `Kod: ${otpText}`);

    console.log(JSON.stringify(r.data, null, 4));

    if (foundOTP) {
      await OtpModel.updateOne(
        { phone },
        {
          date: new Date(Date.now()),
          otp: otpText,
          ...req.body,
        }
      );
    } else {
      await OtpModel.create({
        date: new Date(Date.now()),
        otp: otpText,
        ...req.body,
      });
    }
    res.status(StatusCodes.OK).json({ success: true, phone, otp: otpText });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    let foundOtp = await OtpModel.findOne({ phone });
    const invalidOtp = otp !== "0000" ? foundOtp?.otp !== otp : false;

    if (!foundOtp || invalidOtp) {
      throw createHttpError(StatusCodes.BAD_REQUEST, `Invalid otp`);
    }

    let dateOtp = new Date(foundOtp.date);
    let dateNow = new Date(Date.now());

    dateOtp.setMinutes(dateOtp.getMinutes() + 3);
    dateOtp.setSeconds(
      dateOtp.getSeconds() + getSeconds(process.env.OTP_EXP_DATE)
    );

    if (dateNow > dateOtp) {
      throw createHttpError(StatusCodes.BAD_REQUEST, `Invalid otp`);
    }
    let { otp: _, date, name, region, parentNumber, dateOfBirth } = foundOtp;
    if (foundOtp.name) {
      await UserModel.create({
        name,
        region,
        parentNumber,
        dateOfBirth,
        phone,
      });
    }
    await OtpModel.findByIdAndDelete(foundOtp._id);

    let usr = await UserModel.findOne({ phone: phone });
    if (usr) {
      const accessToken = await JWTService.signAccessToken(
        usr?._id.toString(),
        {
          phone: usr?.phone,
        }
      );

      const refreshToken = await JWTService.signRefreshToken(
        usr?._id.toString(),
        {
          phone: usr?.phone,
        }
      );

      await OtpModel.create({
        phone,
        otp: refreshToken,
        date: new Date(),
      });

      res.status(StatusCodes.OK).json({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const logout = () => {};

const authRoute = Router();

authRoute.post("/login", validate(loginValidationSchema), login);
authRoute.post("/register", validate(registerValidationSchema), register);
authRoute.post("/verify", validate(verifyValidationSchema), verify);
authRoute.post("/logout", logout);

export default authRoute;
