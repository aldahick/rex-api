import { prop } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";

export class RummikubChatMessage {
  @idProp()
  _id!: string;

  @prop()
  playerId?: string;

  @prop({ required: true })
  text!: string;
}
