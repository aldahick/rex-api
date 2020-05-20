import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

export class RummikubChatMessage {
  @MongoService.idProp()
  _id!: string;

  @prop()
  playerId?: string;

  @prop({ required: true })
  text!: string;
}
