import express from "express";
import accountsService from "../services/accounts.service";
import debug from "debug";

const log: debug.IDebugger = debug("app:accounts-controller");

class AccountsController {
  async listAccounts(req: express.Request, res: express.Response) {
    const query = req.query;
    const accounts = await accountsService.getWithQuery(query, 100, 0);
    res.status(200).send(accounts);
  }

  async createAccount(req: express.Request, res: express.Response) {
    const account = await accountsService.add(req.body);
    res.status(201).send(account);
  }

  async updateAccount(req: express.Request, res: express.Response) {
    log(await accountsService.update(req.params.accountId, req.body));
    res.status(204).send();
  }

  async getByIdAccount(req: express.Request, res: express.Response) {
    const account = await accountsService.getByKey(req.params.accountId);
    res.status(200).send(account);
  }
}

export default new AccountsController();
