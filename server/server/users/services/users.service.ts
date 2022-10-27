import debug from "debug";
import { CRUD } from "../../common/interfaces/crud.interface";
import mongooseService from "../../common/services/mongoose.service";
const log: debug.IDebugger = debug("app:users-service");

class UserService implements CRUD {
  Schema = mongooseService.getMongoose().Schema;

  userSchema = new this.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    budgets: [],
    active_budget_id: String,
    permissionLevel: Number,
  });

  User = mongooseService.getMongoose().model("users", this.userSchema);

  async listAccounts(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async getByKey(value: any, key: string = "_id") {
    return this.User.findOne({ [key]: value }).exec();
  }

  async add(userFields: any) {
    const user = new this.User({
      ...userFields,
    });
    await user.save((err, result) => {
      if (err) throw err;
      log(result);
    });
    return;
  }

  async update(key: string, resource: any) {
    log(key, resource);
    const existingAccount = await this.User.findOneAndUpdate(
      { _id: key },
      { $set: resource },
      { new: true }
    ).exec();
    return existingAccount;
  }
  getWithQuery(limit: number, page: number) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
  delete(key: string) {
    return this.User.deleteOne({ _id: key }).exec();
  }
  patch(key: string, resource: any) {
    return this.update(key, resource);
  }
}

export default new UserService();
