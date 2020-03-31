import { prop, arrayProp } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";
import { RummikubCard } from "./RummikubCard";

export class RummikubPlayer {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop()
  userId?: string;

  @prop()
  turnOrder?: number;

  @arrayProp({ required: true, items: RummikubCard, _id: false })
  hand!: RummikubCard[];

  constructor(init?: Omit<RummikubPlayer, "_id" | "toGqlObject">) {
    Object.assign(this, init);
  }
}
