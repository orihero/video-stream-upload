import { ProductModel } from "@database/models/product";
import { TransactionModel } from "@database/models/transaction";
import { UserModel } from "@database/models/user";
import {
  PaymeData,
  PaymeErrors,
  TransactionStates,
} from "@enums/transaction.enums";
import { TransactionError } from "@errors/transaction.error";

export class TransactionService {
  async checkPerformTransaction(params, id) {
    const {
      account: { phone_number: userId },
    } = params;
    let { amount } = params;
    amount = Math.floor(amount / 100);

    const user = await UserModel.findOne({ phone: userId });
    if (!user) {
      throw new TransactionError(
        PaymeErrors.UserNotFound,
        id,
        PaymeData.UserId
      );
    }
  }
  async checkTransaction(params, id) {
    const transaction = await TransactionModel.findOne({ id: params.id });
    if (!transaction) {
      throw new TransactionError(PaymeErrors.TransactionNotFound, id);
    }

    return {
      create_time: transaction.create_time,
      perform_time: transaction.perform_time,
      cancel_time: transaction.cancel_time,
      transaction: transaction.id,
      state: transaction.state,
      reason: transaction.reason,
    };
  }
  async createTransaction(params, id) {
    const {
      account: { phone_number: userId },
      time,
    } = params;
    let { amount } = params;

    amount = Math.floor(amount / 100);

    await this.checkPerformTransaction(params, id);
    let transaction = await TransactionModel.findOne({ id: params.id });
    if (!!transaction) {
      return {
        transaction: transaction.id,
        state: transaction.state,
        create_time: transaction.create_time,
      };
    }

    const newTransaction = await TransactionModel.create({
      id: params.id,
      state: TransactionStates.Pending,
      amount,
      user_id: userId,
      product_id: "productId",
      create_time: time,
      paycom_id: id,
    });

    return {
      transaction: newTransaction.id,
      state: TransactionStates.Pending,
      create_time: newTransaction.create_time,
    };
    // console.log("====================================");
    // console.log({ transaction });
    // console.log("====================================");
    // if (transaction) {
    //   if (transaction.state !== TransactionStates.Pending) {
    //     throw new TransactionError(PaymeErrors.CantDoOperation, id);
    //   }

    //   const currentTime = Date.now();

    //   const expirationTime =
    //     (currentTime - transaction.create_time) / 60000 < 12; // 12m

    //   if (!expirationTime) {
    //     await TransactionModel.findOneAndUpdate(
    //       { id: params.id },
    //       {
    //         state: TransactionStates.PendingCanceled,
    //         reason: 4,
    //       }
    //     );

    //     throw new TransactionError(PaymeErrors.CantDoOperation, id);
    //   }

    //   return {
    //     create_time: transaction.create_time,
    //     transaction: transaction.id,
    //     state: TransactionStates.Pending,
    //   };
    // }

    // // transaction = await TransactionModel.findOne({ id: params.id });

    // // if (transaction) {
    // //   if (transaction.state === TransactionStates.Paid)
    // //     throw new TransactionError(PaymeErrors.AlreadyDone, id);
    // //   if (transaction.state === TransactionStates.Pending)
    // //     throw new TransactionError(PaymeErrors.Pending, id);
    // // }

    // const newTransaction = await TransactionModel.create({
    //   id: params.id,
    //   state: TransactionStates.Pending,
    //   amount,
    //   user_id: userId,
    //   product_id: "productId",
    //   create_time: time,
    // });

    // return {
    //   transaction: newTransaction.id,
    //   state: TransactionStates.Pending,
    //   create_time: newTransaction.create_time,
    // };
  }
  async performTransaction(params, id) {
    const currentTime = Date.now();

    const transaction = await TransactionModel.findOne({ id: params.id });
    if (!transaction) {
      throw new TransactionError(PaymeErrors.TransactionNotFound, id);
    }

    if (transaction.state !== TransactionStates.Pending) {
      if (transaction.state !== TransactionStates.Paid) {
        throw new TransactionError(PaymeErrors.CantDoOperation, id);
      }

      return {
        perform_time: transaction.perform_time,
        transaction: transaction.id,
        state: TransactionStates.Paid,
      };
    }

    const expirationTime = (currentTime - transaction.create_time) / 60000 < 12; // 12m

    if (!expirationTime) {
      await TransactionModel.findOneAndUpdate(
        { id: params.id },
        {
          state: TransactionStates.PendingCanceled,
          reason: 4,
          cancel_time: currentTime,
        }
      );

      throw new TransactionError(PaymeErrors.CantDoOperation, id);
    }

    await TransactionModel.findOneAndUpdate(
      { id: params.id },
      {
        state: TransactionStates.Paid,
        perform_time: currentTime,
      }
    );

    return {
      perform_time: currentTime,
      transaction: transaction.id,
      state: TransactionStates.Paid,
    };
  }
  async cancelTransaction(params, id) {
    const transaction = await TransactionModel.findOne({ id: params.id });
    if (!transaction) {
      throw new TransactionError(PaymeErrors.TransactionNotFound, id);
    }

    const currentTime = Date.now();

    if (transaction.state > 0) {
      await TransactionModel.findOneAndUpdate(
        { id: params.id },
        {
          state: -Math.abs(transaction.state),
          reason: params.reason,
          cancel_time: currentTime,
        }
      );
    }

    return {
      cancel_time: transaction.cancel_time || currentTime,
      transaction: transaction.id,
      state: -Math.abs(transaction.state),
    };
  }
  async getStatement(params, id) {
    const { from: fr, to: t } = params;
    const transactions = await TransactionModel.find({
      create_time: { $gt: fr, $lt: t },
    });
    return transactions.map(
      ({
        id,
        amount,
        user_id: phone_number,
        create_time,
        perform_time,
        cancel_time,
        state,
        reason,
        paycom_id,
      }) => ({
        id,
        time: create_time,
        amount,
        account: { phone_number },
        create_time,
        perform_time,
        cancel_time,
        transaction: paycom_id,
        state,
        reason,
        recievers: null,
      })
    );
  }
}
