import { UserModel } from "@database/models/user";
import { NextFunction, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";

const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //@ts-ignore
    const usr = await UserModel.findById(req.user[0]._id);
    //@ts-ignore
    console.log(req.user[0]._id);
    
    res.status(StatusCodes.OK).json(usr);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const userRoute = Router();

userRoute.get("/me", me);

export default userRoute;
