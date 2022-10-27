import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";
import accountsController from "./controllers/accounts.controller";

export class AccountRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "AccountRoutes");
  }

  configureRoutes() {
    this.app.route(`/api/accounts`).get(accountsController.listAccounts);
    
    this.app.route("/api/account").post(accountsController.createAccount);
    
    
    this.app.route(`/api/account/:accountId`)
      .get(accountsController.getByIdAccount)
      .put(accountsController.updateAccount);
    return this.app;
  }
}
