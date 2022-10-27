import debug from "debug";
import { CRUD } from "../../common/interfaces/crud.interface";
import mongooseService from "../../common/services/mongoose.service";
const log: debug.IDebugger = debug("app:categories-service");

class CategoryGroupService implements CRUD {
  Schema = mongooseService.getMongoose().Schema;

  categorySchema = new this.Schema({
    name: { type: String, required: true },
    hidden: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },   
    budget_id: { type: String, required: true }, 
  });

  CategoryGroup = mongooseService
    .getMongoose()
    .model("category_group", this.categorySchema);

  async listAccounts(limit = 25, page = 0) {
    return this.CategoryGroup.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  async getByKey(value: any, key: string = "_id") {
    return this.CategoryGroup.findOne({ [key]: value }).exec();
  }

  async add(categoryFields: any) {
    console.log("🚀 ~ file: category_groups.service.ts ~ line 32 ~ CategoryGroupService ~ add ~ categoryFields", categoryFields)
    const category = new this.CategoryGroup({
      ...categoryFields,
    });
    await category.save();
    return category;
  }

  async update(key: string, resource: any) {
    log(key, resource);
    const existingAccount = await this.CategoryGroup.findOneAndUpdate(
      { _id: key },
      { $set: resource },
      { new: true }
    ).exec();
    return existingAccount;
  }
  getWithQuery(query: any, limit: number, page: number) {
    return this.CategoryGroup.find(query)
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
  delete(key: string) {
    return this.CategoryGroup.deleteOne({ _id: key }).exec();
  }
  patch(key: string, resource: any) {
    return this.update(key, resource);
  }
}

export default new CategoryGroupService();
