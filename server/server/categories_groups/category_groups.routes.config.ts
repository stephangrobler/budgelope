import express from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import categoryGroupsController from "./controllers/category_groups.controller";

export class CategoryGroupsRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "CategoryGroupsRoutes");
  }

  configureRoutes() {
    this.app.route("/api/categorygroups").get(categoryGroupsController.listCategoryGroups);
    this.app.route("/api/categorygroup").post(categoryGroupsController.createCategoryGroup);
    this.app
      .route(`/api/categorygroup/:categoryGroupId`)
      .get(categoryGroupsController.getById)
      .put(categoryGroupsController.updateCategoryGroup);

    return this.app;
  }
}
