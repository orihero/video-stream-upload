import { BaseError } from "./base.error";

export class TransactionError extends BaseError {
  transactionErrorCode: number;
  transactionErrorMessage: { ru: string; uz: string; en: string };
  transactionData: string;
  transactionId: string;
  isTransactionError: boolean;
  constructor(
    transactionError: {
      name: string;
      code: number;
      message: { ru: string; uz: string; en: string };
    },
    id,
    data?
  ) {
    super(transactionError.name);

    this.transactionErrorCode = transactionError.code;
    this.transactionErrorMessage = transactionError.message;
    this.transactionData = data;
    this.transactionId = id;
    this.isTransactionError = true;
  }
}
