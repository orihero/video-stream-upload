import createHttpError from "http-errors";
import { IUser, UserModel } from "@database/models/user";
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

const update = async (
  req: Request<undefined, undefined, Partial<IUser>>,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    let usr = await UserModel.findById(req.user[0]._id);

    //@ts-ignore
    let user = { ...usr?.toObject(), ...req.body };

    //@ts-ignore
    await UserModel.findByIdAndUpdate(usr?._id, user);
    res.status(StatusCodes.OK).json(usr);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const setProgress = async (
  req: Request<
    undefined,
    null,
    null,
    {
      classId: string;
      courseId: string;
      testResult: string;
      videoId: string;
      progress: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  let usr = await UserModel.findById(req.user[0]._id);
  let {
    classId,
    courseId,
    testResult = "-1",
    videoId,
    progress: videoProgress,
  } = req.query;
  if (!usr) {
    res.send(createHttpError(StatusCodes.BAD_REQUEST, "User not found"));
  }
  console.log("====================================");
  console.log(req.query);
  console.log("====================================");
  if (!usr?.progress) {
    usr!.progress = [];
  }
  let progress = usr?.progress.find(
    (e) => e.courseId === courseId && e.classId === classId
  );
  if (!progress) {
    usr?.progress.push({
      classId,
      courseId,
      progress: [
        { videoId, progress: videoProgress, testResult: parseInt(testResult) },
      ],
    });
  } else {
    const p = progress.progress.find((e) => e.videoId === videoId);
    if (!p) {
      progress.progress.push({
        videoId,
        progress: videoProgress,
        testResult: parseInt(testResult),
      });
    } else {
      progress.progress = progress.progress.map((e) => {
        if (e.videoId === videoId) {
          return { ...e, testResult: parseInt(testResult), videoId };
        }
        return e;
      });
    }
  }
  await usr?.save();
  res.sendStatus(StatusCodes.ACCEPTED);
};

const userRoute = Router();

userRoute.get("/me", me);
userRoute.put("/me", update);
userRoute.put("/setProgress", setProgress);

export default userRoute;
