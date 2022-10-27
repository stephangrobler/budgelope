import debug from "debug";
import { CRUD } from "../../common/interfaces/crud.interface";
import mongooseService from "../../common/services/mongoose.service";
const log: debug.IDebugger = debug("app:budgets-service");

class AccountService implements CRUD {
  Schema = mongooseService.getMongoose().Schema;

  accountSchema = new this.Schema({
    name: String,
    balance: Number,
    budget_id: String,
  });

  Account = mongooseService.getMongoose().model("accounts", this.accountSchema);

  async listAccounts(limit = 25, page = 0) {
    return this.Account.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async getByKey(value: any, key: string = "_id") {
    return this.Account.findOne({ [key]: value }).exec();
  }

  async add(accountFields: any) {
    const account = new this.Account({
      ...accountFields,
    });
    await account.save((err, result) => {
      if (err) throw err;
      log(result);
    });
    return account;
  }

  async update(key: string, resource: any) {
    log(key, resource);
    const existingAccount = await this.Account.findOneAndUpdate(
      { _id: key },
      { $set: resource },
      { new: true }
    ).exec();
    return existingAccount;
  }
  getWithQuery(query: any, limit: number, page: number) {
    return this.Account.find(query)
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
  delete(key: string) {
    return this.Account.deleteOne({ _id: key }).exec();
  }
  patch(key: string, resource: any) {
    return this.update(key, resource);
  }
}

export default new AccountService();
