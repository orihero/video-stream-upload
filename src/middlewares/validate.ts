import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { getReasonPhrase, getStatusText, StatusCodes } from "http-status-codes";
import { ValidationError, ObjectSchema } from "yup";
import { objectIdRegex } from "./../constants/regex";

export const validate =
  // @ts-ignore


    (schema: ObjectSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(JSON.stringify(req.body, null, 4));
        await schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        next();
      } catch (e) {
        const errors: any = (e as ValidationError).inner.reduce(
          // @ts-ignore
          (errors, current) => ({ ...errors, [current.path]: current.errors }),
          {}
        );

        res.status(StatusCodes.BAD_REQUEST).json({
          code: StatusCodes.BAD_REQUEST,
          error: true,
          message: getReasonPhrase(StatusCodes.BAD_REQUEST),
          payload: errors.payload || errors.data || errors,
        });
      }
    };

export const validateIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id.match(objectIdRegex)) {
    throw createHttpError(
      StatusCodes.NOT_FOUND,
      getStatusText(StatusCodes.NOT_FOUND)
    );
  }

  next();
};
