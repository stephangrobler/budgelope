import debug from "debug";
import accountsService from "../../accounts/services/accounts.service";
import { CRUD } from "../../common/interfaces/crud.interface";
import mongooseService from "../../common/services/mongoose.service";
const log: debug.IDebugger = debug("app:transactions-service");

class TransactionService implements CRUD {
  Schema = mongooseService.getMongoose().Schema;

  transactionSchema = new this.Schema({
    name: String,
    amount: Number,
    budget_id: { type: String, required: true },
    payee_id: { type: String, required: true },
    account_id: { type: String, required: true },
    category_id: { type: String, required: true },
    memo: String,
    split: [],
    cleared: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    date: { type: Date, default: Date.now() },
    account: { type: this.Schema.Types.ObjectId, ref: "accounts" },
    category: { type: this.Schema.Types.ObjectId, ref: "categories" },
    payee: { type: this.Schema.Types.ObjectId, ref: "payees" },
  });

  Transaction = mongooseService
    .getMongoose()
    .model("transactions", this.transactionSchema);

  constructor() {
    accountsService.Account;
  }

  async listAccounts(limit = 25, page = 0) {
    return this.Transaction.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async getByKey(value: any, key: string = "_id") {
    return this.Transaction.findOne({ [key]: value }).exec();
  }

  async add(transactionFields: any) {
    transactionFields.account = transactionFields.account_id;
    const transaction = new this.Transaction({
      ...transactionFields,
    });
    await transaction.save((err, result) => {
      if (err) throw err;
      log(result);
    });
    return transaction;
  }

  async update(key: string, resource: any) {
    log(key, resource);
    const existingAccount = await this.Transaction.findOneAndUpdate(
      { _id: key },
      { $set: resource },
      { new: true }
    ).exec();
    return existingAccount;
  }

  getWithQuery(query: any, limit: number, page: number) {
    return this.Transaction.find(query)
      .populate("account")
      .populate("category")
      .populate("payee")
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  delete(key: string) {
    return this.Transaction.deleteOne({ _id: key }).exec();
  }

  patch(key: string, resource: any) {
    return this.update(key, resource);
  }
}

export default new TransactionService();
