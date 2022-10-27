import express from "express";
import debug from "debug";
import transactionsService from "../services/transactions.service";

const log: debug.IDebugger = debug("app:transactions-controller");

class TransactionsController {
  async listTransactions(req: express.Request, res: express.Response) {
    const query = req.query;
    const transactions = await transactionsService.getWithQuery(query, 100, 0);
    res.status(200).send(transactions);
  }

  async createTransaction(req: express.Request, res: express.Response) {
    const transaction = await transactionsService.add(req.body);
    res.status(201).send(transaction);
  }

  async updateTransaction(req: express.Request, res: express.Response) {
    log(await transactionsService.update(req.params.transactionId, req.body));
    res.status(204).send();
  }
}

export default new TransactionsController();
