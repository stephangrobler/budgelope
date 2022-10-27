import express from "express";
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import { CommonRoutesConfig } from "../common/common.routes.config";
import transactionsController from "./controllers/transactions.controller";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { body } from "express-validator";

export class TransactionRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "TransactionRoutes");
  }

  configureRoutes() {
    this.app
      .route("/api/transactions")
      .get(transactionsController.listTransactions);

    this.app.post(
      `/api/transaction`,
      body("payee_id").notEmpty().isString(),
      body("account_id").notEmpty().isString(),
      body("category_id").notEmpty().isString(),
      body("budget_id").notEmpty().isString(),
      body("amount").notEmpty().isNumeric(),
      body("cleared").optional().isBoolean(),

      BodyValidationMiddleware.verifyBodyFieldsErrors,
      jwtMiddleware.validJWTNeeded,
      transactionsController.createTransaction
    );

    this.app
      .route(`/api/transactions/:transactionId`)
      .put(transactionsController.updateTransaction);

    return this.app;
  }
}
