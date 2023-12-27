import passport from "passport";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";

const authenticate = (req, res, next) =>
  passport.authenticate("jwt", { session: false }, (error: any, user: any) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return next(createHttpError(StatusCodes.UNAUTHORIZED));
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return next();
    });
  })(req, res, next);

export default authenticate;
