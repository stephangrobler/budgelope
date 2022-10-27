import { Schema } from "mongoose";
import mongooseService from "../common/services/mongoose.service";
import debug from "debug";
const log: debug.IDebugger = debug("app:users-dao");

export class User {
  Schema = mongooseService.getMongoose().Schema;

  ThirdPartyProviderSchema = new this.Schema({
    providerName: {
      type: String,
      default: null,
    },
    provider_id: {
      type: String,
      default: null,
    },
    provider_data: {
      type: {},
      default: null,
    },
  });

  UserSchema = new this.Schema(
    {
      name: {
        type: String,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      email_is_verified: {
        type: Boolean,
        default: false,
      },
      password: {
        type: String,
      },
      referral_code: {
        type: String,
        default: function () {
          let hash = 0;
          // for (let i = 0; i < email.length; i++) {
          //   hash = email.charCodeAt(i) + ((hash << 5) - hash);
          // }
          let res = (hash & 0x00ffffff).toString(16).toUpperCase();
          return "00000".substring(0, 6 - res.length) + res;
        },
      },
      referred_by: {
        type: String,
        default: null,
      },
      third_party_auth: [this.ThirdPartyProviderSchema],
      date: {
        type: Date,
        default: Date.now,
      },
    },
    { strict: false }
  );

  User = mongooseService.getMongoose().model("Users", this.UserSchema);

  constructor() {
    log("Created new instance of UsersDao");
  }
}
export default new User();
