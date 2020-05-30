import { MongoService } from "@athenajs/core";
import { arrayProp,prop } from "@typegoose/typegoose";
import * as _ from "lodash";
import { IRummikubCardColor,IRummikubGame,IRummikubGamePrivacy } from "../../graphql/types";
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

  drawCard(player: RummikubPlayer) {
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
      c => `${c.value}-${c.color}`
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
