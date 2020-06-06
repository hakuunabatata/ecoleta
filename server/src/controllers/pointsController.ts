import { Request, Response } from "express";
import knex from "../db/connection";

class PointsController {
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      zipzorp,
      latitude,
      longitude,
      cidade,
      estado,
      items,
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      image: `http://192.168.100.3:3333/uploads/${req.file.filename}`,
      name,
      email,
      zipzorp,
      latitude,
      longitude,
      cidade,
      estado,
    };

    const InsertedIds = await trx("points").insert(point);

    const idPoint = InsertedIds[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((idItem: number) => {
        return {
          idItem,
          idPoint,
        };
      });
    console.log({ pointItems });

    await trx("pointItems").insert(pointItems);

    await trx.commit();

    return res.json({ idPoint, ...point });
  }
  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("points").where("idPoint", id).first();

    // const serializedPoint = {
    //   ...point,
    //   image: `http://192.168.100.3:3333/uploads/${point.image}`,
    // };

    const items = await knex("items")
      .join("pointItems", "items.idItem", "=", "pointItems.idItem")
      .where("pointItems.idPoint", id)
      .select("items.title");

    return !point
      ? res.status(400).json({ message: "Point not found" })
      : res.json({ point, items });
  }

  async index(req: Request, res: Response) {
    const { cidade, estado, items } = req.query;
    console.log(cidade, estado, items);

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("pointItems", "points.idPoint", "=", "pointItems.idPoint")
      .whereIn("pointItems.idItem", parsedItems)
      .where("cidade", String(cidade))
      .where("estado", String(estado))
      .distinct()
      .select("points.*");

    // const serializedPoints = points.map((point) => {
    //   return {
    //     ...point,
    //     image: `http://192.168.100.3:3333/uploads/${point.image}`,
    //   };
    // });

    return res.json(points);
  }
}

export default PointsController;
