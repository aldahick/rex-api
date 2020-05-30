import { HttpError,websocketEvent, WebsocketPayload } from "@athenajs/core";
import * as joi from "@hapi/joi";
import { singleton } from "tsyringe";
import {
  IRummikubCardColor,
  IRummikubClientChatPayload,
  IRummikubClientJoinPayload,
  IRummikubClientPlaceCardPayload,
  IRummikubClientPlaceCardsPayload} from "../graphql/types";
import { RummikubManager } from "../manager/rummikub";
import { RummikubGame, RummikubGameStatus } from "../model/RummikubGame";

@singleton()
export class RummikubWebsocketHandler {
  constructor(
    private rummikubManager: RummikubManager
  ) { }

  @websocketEvent("disconnect")
  async onDisconnect({ socket }: WebsocketPayload<void, any>) {
    let game: RummikubGame;
    try {
      game = await this.rummikubManager.socket.getGame(socket);
    } catch (err) {
      // we don't really care
      return;
    }
    // resend players now that one has disconnected
    this.rummikubManager.socket.sendPlayers(game);
  }

  @websocketEvent("rummikub.client.join", joi.object({
    gameId: joi.string().required(),
    displayName: joi.string().required()
  }).required())
  async onJoin({ data: { gameId, displayName }, socket }: WebsocketPayload<IRummikubClientJoinPayload, any>) {
    let game = await this.rummikubManager.game.get(gameId);
    const player = await this.rummikubManager.game.join(game, displayName, socket.id);
    // refetch game after operations are complete
    game = await this.rummikubManager.game.get(gameId);
    await this.rummikubManager.socket.setGameId(socket, game._id);
    this.rummikubManager.socket.setPlayerId(socket, player._id);
    // the client won't know they've joined until this returns - give them
    // a moment to prepare to receive events
    socket.emit("rummikub.client.join", true);
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          this.rummikubManager.socket.sendPlayers(game);
          if (game.status === RummikubGameStatus.InProgress) {
            this.rummikubManager.socket.sendTurn(game);
            this.rummikubManager.socket.sendBoard(game);
            this.rummikubManager.socket.sendHand(socket).then(resolve).catch(reject);
          } else {
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      }, 500);
    });
  }

  @websocketEvent("rummikub.client.chat", joi.object({
    message: joi.string().required()
  }).required())
  async onChat({ data: { message }, socket }: WebsocketPayload<IRummikubClientChatPayload, any>) {
    const game = await this.rummikubManager.socket.getGame(socket);
    const player = await this.rummikubManager.socket.getPlayer(socket, game);
    const chatMessage = await this.rummikubManager.game.createChat(game, message, player);
    this.rummikubManager.socket.sendChat(game, chatMessage);
  }

  @websocketEvent("rummikub.client.endTurn")
  async onEndTurn({ socket }: WebsocketPayload<void, any>) {
    let game = await this.rummikubManager.socket.getGame(socket);
    const playerId = this.rummikubManager.socket.getPlayerId(socket);
    if (game.currentPlayerId !== playerId) {
      throw HttpError.forbidden("It's not your turn!");
    }
    const chatMessage = await this.rummikubManager.game.nextTurn(game);
    game = await this.rummikubManager.game.get(game._id);
    this.rummikubManager.socket.sendTurn(game);
    this.rummikubManager.socket.sendChat(game, chatMessage);
  }

  @websocketEvent("rummikub.client.placeCards", joi.object({
    cards: joi.array().items(joi.object({
      color: joi.string().valid(...Object.values(IRummikubCardColor)).required(),
      value: joi.number()
    }).required()).required(),
    boardIndex: joi.number().required(),
    rowIndex: joi.number().required()
  }).required())
  async onPlaceCards({
    data: {
      cards,
      boardIndex,
      rowIndex
    },
    socket
  }: WebsocketPayload<IRummikubClientPlaceCardsPayload, any>) {
    let game = await this.rummikubManager.socket.getGame(socket);
    const player = await this.rummikubManager.socket.getPlayer(socket, game);
    await this.rummikubManager.game.placeCards(game, player, { cards, boardIndex, rowIndex });
    game = await this.rummikubManager.game.get(game._id);
    await this.rummikubManager.socket.sendHand(socket);
    this.rummikubManager.socket.sendBoard(game);
  }

  @websocketEvent("rummikub.client.placeCard", joi.object({
    fromRowIndex: joi.number(),
    fromCardIndex: joi.number().required(),
    toRowIndex: joi.number(),
    toCardIndex: joi.number().required()
  }).required())
  async onPlaceCard({ data, socket }: WebsocketPayload<IRummikubClientPlaceCardPayload, any>) {
    let game = await this.rummikubManager.socket.getGame(socket);
    try {
      const player = await this.rummikubManager.socket.getPlayer(socket, game);
      const chatMessage = await this.rummikubManager.game.placeCard(game, player, data);
      game = await this.rummikubManager.game.get(game._id);
      this.rummikubManager.socket.sendBoard(game);
      this.rummikubManager.socket.sendChat(game, chatMessage);
    } catch (err) {
      this.rummikubManager.socket.sendBoard(game, socket);
      throw err;
    } finally {
      await this.rummikubManager.socket.sendHand(socket);
    }
  }

  @websocketEvent("rummikub.client.start")
  async onStart({ socket }: WebsocketPayload<void, any>) {
    let game = await this.rummikubManager.socket.getGame(socket);
    if (game.status !== RummikubGameStatus.Lobby) {
      return true;
    }
    await this.rummikubManager.game.start(game);
    game = await this.rummikubManager.game.get(game._id);
    await this.rummikubManager.socket.sendStart(game);
    return true;
  }
}
