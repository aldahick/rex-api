import { MongoService } from "@athenajs/core";
import { arrayProp,prop } from "@typegoose/typegoose";
import * as randomstring from "randomstring";
import { RummikubCard } from "./RummikubCard";

export class RummikubPlayer {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @arrayProp({ required: true, items: RummikubCard, _id: false })
  hand!: RummikubCard[];

  @prop({ required: true })
  socketId!: string;

  constructor(init?: Omit<RummikubPlayer, "toGqlObject" | "_id"> & { _id?: string }) {
    Object.assign(this, {
      _id: randomstring.generate(),
      ...init
    });
  }
}
