import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";
import * as randomstring from "randomstring";

export class RummikubChatMessage {
  @MongoService.idProp()
  _id!: string;

  @prop()
  playerId?: string;

  @prop({ required: true })
  createdAt!: Date;

  @prop({ required: true })
  text!: string;

  constructor(init?: Omit<RummikubChatMessage, "_id">) {
    Object.assign(this, init);
    this._id = randomstring.generate();
  }
}
