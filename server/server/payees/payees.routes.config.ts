import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";
import PayeeController from "./controllers/payees.controller";

export class PayeeRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "PayeeRoutes");
  }

  configureRoutes() {
    this.app.route(`/api/payees`).get(PayeeController.listPayees);
    this.app.post(`/api/payee`, PayeeController.createPayee);

    this.app
      .route(`/api/payee/:payeeId`)
      // .get(PayeeController.getPayeeById)
      .put(PayeeController.updatePayee);
    return this.app;
  }
}
