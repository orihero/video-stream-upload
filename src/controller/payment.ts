import { PaymeMethods } from "@enums/transaction.enums";
import { NextFunction, Request, Response, Router } from "express";
import { TransactionService } from "@services/transaction.service";

const payme = async (req: Request, res: Response, next: NextFunction) => {
  try {
    try {
      const { method, params, id } = req.body;
      const service = new TransactionService();
      switch (method) {
        case PaymeMethods.CheckPerformTransaction: {
          await service.checkPerformTransaction(params, id);

          return res.json({ result: { allow: true } });
        }
        case PaymeMethods.CheckTransaction: {
          const result = await service.checkTransaction(params, id);

          return res.json({ result, id });
        }
        case PaymeMethods.CreateTransaction: {
          const result = await service.createTransaction(params, id);

          return res.json({ result, id });
        }
        case PaymeMethods.PerformTransaction: {
          const result = await service.performTransaction(params, id);

          return res.json({ result, id });
        }
        case PaymeMethods.CancelTransaction: {
          const result = await service.cancelTransaction(params, id);

          return res.json({ result, id });
        }
      }
    } catch (err: any) {
      console.log("====================================");
      console.log(JSON.stringify(err, null, 4));
      console.log(JSON.stringify(req.body, null, 4));
      console.log("====================================");
      res.json({
        error: {
          code: err.transactionErrorCode,
          message: err.transactionErrorMessage,
          data: err.transactionData,
        },
        id: req.body.id,
      });
    }
  } catch (error) {}
};

const paymentRoute = Router();

paymentRoute.post("/pay", payme);

export default paymentRoute;
