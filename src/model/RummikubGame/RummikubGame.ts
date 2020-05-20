import { MongoService } from "@athenajs/core";
import { arrayProp,prop } from "@typegoose/typegoose";
import { IRummikubGamePrivacy,IRummikubGameStatus } from "../../graphql/types";
import { RummikubCard } from "./RummikubCard";
import { RummikubChatMessage } from "./RummikubChatMessage";
import { RummikubPlayer } from "./RummikubPlayer";

export class RummikubGame {
  @MongoService.idProp()
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
