import { prop } from "@typegoose/typegoose";
import { MongoService } from "@athenajs/core";

export class RummikubChatMessage {
  @MongoService.idProp()
  _id!: string;

  @prop()
  playerId?: string;

  @prop({ required: true })
  text!: string;
}
