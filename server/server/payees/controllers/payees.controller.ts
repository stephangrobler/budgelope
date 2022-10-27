import express from "express";
import payeesService from "../services/payees.service";
import debug from "debug";

const log: debug.IDebugger = debug("app:payees-controller");

class PayeesController {
  async listPayees(req: express.Request, res: express.Response) {
    const query = req.query;
    const payees = await payeesService.getWithQuery(query, 100, 0);
    res.status(200).send(payees);
  }

  async createPayee(req: express.Request, res: express.Response) {
    const payee = await payeesService.add(req.body);
    res.status(201).send(payee);
  }

  async updatePayee(req: express.Request, res: express.Response) {
    log(await payeesService.update(req.params.payeeId, req.body));
    res.status(204).send();
  }
}

export default new PayeesController();
