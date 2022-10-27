import express from "express";
import debug from "debug";
import categoriesService from "../services/categories.service";

const log: debug.IDebugger = debug("app:categories-controller");

class CategoriesController {
  async listCategories(req: express.Request, res: express.Response) {
    const query = req.query;
    const categories = await categoriesService.getWithQuery(query, 100, 0);
    res.status(200).send(categories);
  }

  async createCategory(req: express.Request, res: express.Response) {
    const category = await categoriesService.add(req.body);
    res.status(200).send(category);
  }

  async updateCategory(req: express.Request, res: express.Response) {
    log(await categoriesService.update(req.params.categoryId, req.body));
    res.status(204).send();
  }

  async getById(req: express.Request, res: express.Response) {
    const category = await categoriesService.getByKey(req.params.categoryId);
    res.status(200).send(category);
  }
}

export default new CategoriesController();
