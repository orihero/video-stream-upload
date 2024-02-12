import { PaymeErrors } from "@enums/transaction.enums";
import { TransactionError } from "@errors/transaction.error";
import base64 from "base-64";
import { environments } from "@config/environment";
import { Request, Response } from "express";

const PAYME_MERCHANT_KEY = environments.PAYME_MERCHANT_KEY;

export const paymeCheckToken = (req: Request, res: Response, next) => {
  try {
    const { id } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      throw new TransactionError(PaymeErrors.InvalidAuthorization, id);

    const data = base64.decode(token);

    if (!data.includes(PAYME_MERCHANT_KEY)) {
      throw new TransactionError(PaymeErrors.InvalidAuthorization, id);
    }

    next();
  } catch (err: any) {
    res.json({
      error: {
        code: err.transactionErrorCode,
        message: err.transactionErrorMessage,
        data: err.transactionData,
      },
      id: req.body.id,
    });
  }
};
