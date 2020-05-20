import { MongoService } from "@athenajs/core";
import { arrayProp,prop } from "@typegoose/typegoose";
import * as randomstring from "randomstring";
import { RummikubCard } from "./RummikubCard";

export class RummikubPlayer {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  userId!: string;

  @prop()
  turnOrder?: number;

  @arrayProp({ required: true, items: RummikubCard, _id: false })
  hand!: RummikubCard[];

  constructor(init?: Omit<RummikubPlayer, "toGqlObject" | "_id"> & { _id?: string }) {
    Object.assign(this, {
      _id: randomstring.generate(),
      ...init
    });
  }
}
