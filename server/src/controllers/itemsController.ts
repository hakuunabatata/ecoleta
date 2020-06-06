import { Request, Response } from "express";
import knex from "../db/connection";

class ItemsController {
  async index(req: Request, res: Response) {
    const items = await knex("items").select("*");

    return res.json(items);
  }
}

export default ItemsController;
