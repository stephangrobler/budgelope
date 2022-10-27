import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";
import BudgetsController from "./controllers/budgets.controller";

export class BudgetRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "BudgetRoutes");
  }

  configureRoutes() {
    this.app
      .route(`/api/budgets`)
      .get(BudgetsController.listBudgets)
      .post(BudgetsController.createBudget);

    this.app
      .route(`/api/budget/:budgetId`)
      .get(BudgetsController.getUserById)
      .put(BudgetsController.updateBudget);
    return this.app;
  }
}
