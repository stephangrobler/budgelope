import express from "express";
import debug from "debug";
import budgetsService from "../services/budgets.service";

const log: debug.IDebugger = debug("app:budgets-controller");

class BudgetsController {
  async listBudgets(req: express.Request, res: express.Response) {
    console.log(req.params, req.body, req.query);
    const budgets = await budgetsService.getWithQuery(req.query, 100, 0);
    res.status(200).send(budgets);
  }

  async createBudget(req: express.Request, res: express.Response) {
    const body = req.body;
    log(body);
    const budget = await budgetsService.add(body);

    res.status(201).send(budget);
  }

  async getUserById(req: express.Request, res: express.Response) {
    const budget = await budgetsService.getByKey(req.params.budgetId);
    res.status(200).send(budget);
  }

  async updateBudget(req: express.Request, res: express.Response) {
    log(await budgetsService.update(req.params.budgetId, req.body));
    res.status(204).send();
  }
}

export default new BudgetsController();
