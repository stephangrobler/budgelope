import debug from "debug";
import { CRUD } from "../../common/interfaces/crud.interface";
import mongooseService from "../../common/services/mongoose.service";

const log: debug.IDebugger = debug("app:budgets-service");

class BudgetService {
  Schema = mongooseService.getMongoose().Schema;
  budgetSchema = new this.Schema({
    name: String,
    balance: Number,
    userId: String,
    allocations: [],
  });

  Budget = mongooseService.getMongoose().model("budgets", this.budgetSchema);

  async list(limit: number = 25, page: number = 0) {
    return this.Budget.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async add(budgetFields: any) {
    const budget = new this.Budget({
      ...budgetFields,
    });
    await budget.save((err, result) => {
      if (err) throw err;
      log(result);
    });
    return;
  }

  async getByKey(value: any, key: string = "_id") {
    return this.Budget.findOne({ [key]: value }).exec();
  }

  async getWithQuery(query: any, limit: number, page: number) {
    return this.Budget.find(query)
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
  async update(key: string, resource: any) {
    log(resource);
    const existingBudget = await this.Budget.findOneAndUpdate(
      { _id: key },
      { $set: resource },
      { new: true }
    ).exec();
    return existingBudget;
  }
  async delete(key: string) {
    return this.Budget.deleteOne({ _id: key }).exec();
  }
  async patch(key: string, resource: any) {
    return this.update(key, resource);
  }
}

export default new BudgetService();
