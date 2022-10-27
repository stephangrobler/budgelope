import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";
import usersController from "./controllers/users.controller";
import jwtMiddleware from "../auth/middleware/jwt.middleware";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "UsersRoutes");
  }

  configureRoutes() {
    this.app
      .route(`/api/users`)
      .get(jwtMiddleware.validJWTNeeded, usersController.listUsers)
      .post(usersController.createUser);

    this.app.get(
      `/api/users/me`,
      jwtMiddleware.validJWTNeeded,
      usersController.getFromToken
    );

    this.app
      .route(`/api/users/:userId`)

      .get(usersController.getById)
      .put(usersController.updateUser)
      .patch((req: express.Request, res: express.Response) => {
        res.status(200).send(`PATCH requested for id ${req.params.userId}`);
      })
      .delete((req: express.Request, res: express.Response) => {
        res.status(200).send(`DELETE requested for id ${req.params.userId}`);
      });

    return this.app;
  }
}
