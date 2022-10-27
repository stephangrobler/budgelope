import express from "express";
import bcrypt from "bcryptjs";
import usersService from "../services/users.service";
import debug from "debug";

const log: debug.IDebugger = debug("app:users-controller");

class UsersController {
  async listUsers(req: express.Request, res: express.Response) {
    const users = await usersService.getWithQuery(100, 0);
    res.status(200).send(users);
  }

  async createUser(req: express.Request, res: express.Response) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const user = await usersService.add(req.body);
    res.status(201).send(user);
  }

  async updateUser(req: express.Request, res: express.Response) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const user = await usersService.update(req.params.userId, req.body);
    log(user);
    res.status(204).send(user);
  }

  async getById(req: express.Request, res: express.Response) {
    const user = await usersService.getByKey(req.params.userId);
    res.status(200).send(user);
  }

  async getFromToken(req: express.Request, res: express.Response) {
    const user = await usersService.getByKey(res.locals.jwt.userId);
    res.status(200).send(user);
  }
}

export default new UsersController();
