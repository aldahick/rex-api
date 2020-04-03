import { prop, arrayProp } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";
import { IRummikubGameStatus, IRummikubGamePrivacy } from "../../graphql/types";
import { RummikubPlayer } from "./RummikubPlayer";
import { RummikubChatMessage } from "./RummikubChatMessage";
import { RummikubCard } from "./RummikubCard";

export class RummikubGame {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true, enum: IRummikubGameStatus })
  status!: IRummikubGameStatus;

  @prop({ required: true, enum: IRummikubGamePrivacy })
  privacy!: IRummikubGamePrivacy;

  @arrayProp({ required: true, items: RummikubCard, _id: false, dimensions: 2 })
  board!: RummikubCard[][];

  @arrayProp({ required: true, items: RummikubPlayer })
  players!: RummikubPlayer[];

  @arrayProp({ required: true, items: RummikubChatMessage })
  chatMessages!: RummikubChatMessage[];

  @prop()
  winningPlayerId?: string;

  @prop()
  currentPlayerId?: string;

  constructor(init?: Omit<RummikubGame, "_id" | "toGqlObject">) {
    Object.assign(this, init);
  }
}
