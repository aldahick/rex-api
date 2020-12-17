import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";
import * as _ from "lodash";

import { IRummikubCardColor, IRummikubGame, IRummikubGamePrivacy } from "../../graphql";
import { RummikubCard } from "./RummikubCard";
import { RummikubChatMessage } from "./RummikubChatMessage";
import { RummikubGameStatus } from "./RummikubGameStatus";
import { RummikubPlayer } from "./RummikubPlayer";

export class RummikubGame {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true, enum: RummikubGameStatus })
  status!: RummikubGameStatus;

  @prop({ required: true, enum: IRummikubGamePrivacy })
  privacy!: IRummikubGamePrivacy;

  @prop({ required: true, type: RummikubCard, _id: false, dim: 2 })
  board!: RummikubCard[][];

  @prop({ required: true, type: RummikubPlayer })
  players!: RummikubPlayer[];

  @prop({ required: true, type: RummikubChatMessage })
  chatMessages!: RummikubChatMessage[];

  @prop()
  winningPlayerId?: string;

  @prop()
  currentPlayerId?: string;

  constructor(init?: Omit<RummikubGame, "_id" | "availableCards" | "drawCard" | "toGqlObject">) {
    Object.assign(this, init);
  }

  toGqlObject(): IRummikubGame {
    return {
      _id: this._id,
      name: this.name,
      playerNames: this.players.map(p => p.name)
    };
  }

  drawCard(player: RummikubPlayer): void {
    const availableCards = this.availableCards;
    player.hand.push(availableCards[_.random(0, availableCards.length - 1)]);
  }

  get availableCards(): RummikubCard[] {
    const boardCards = _.flatten(this.board);
    const playerCards = _.flatten(this.players.map(p => p.hand));
    const allCards = RummikubGame.allCards;
    return _.differenceBy(
      allCards,
      boardCards.concat(playerCards),
      c => `${c.value ?? "joker"}-${c.color}`
    );
  }

  static get allCards(): RummikubCard[] {
    return _.flatten(_.range(15).map(value =>
      Object.values(IRummikubCardColor).map(color => ({
        color, value
      }))
    ));
  }
}
