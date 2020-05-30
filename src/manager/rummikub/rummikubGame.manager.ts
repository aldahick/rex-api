import { HttpError } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { IRummikubGamePrivacy } from "../../graphql/types";
import { RummikubCard,RummikubChatMessage,RummikubGame, RummikubGameStatus,RummikubPlayer } from "../../model/RummikubGame";
import { DatabaseService } from "../../service/database";

@singleton()
export class RummikubGameManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<RummikubGame> {
    const game = await this.db.rummikubGames.findById(id);
    if (!game) {
      throw HttpError.notFound(`rummikub game id="${id}" not found`);
    }
    return game;
  }

  getJoinable(): Promise<RummikubGame[]> {
    return this.db.rummikubGames.find({
      status: RummikubGameStatus.Lobby,
      privacy: IRummikubGamePrivacy.Public
    }).exec();
  }

  create(privacy: IRummikubGamePrivacy, name: string): Promise<RummikubGame> {
    return this.db.rummikubGames.create(new RummikubGame({
      name,
      status: RummikubGameStatus.Lobby,
      privacy,
      players: [],
      chatMessages: [],
      board: []
    }));
  }

  async join(game: RummikubGame, displayName: string, socketId: string): Promise<RummikubPlayer> {
    const playerIndex = game.players.findIndex(p => p.name.toLowerCase() === displayName.toLowerCase());
    let player: RummikubPlayer;
    if (playerIndex !== -1) {
      player = game.players[playerIndex];
      player.socketId = socketId;
      await this.db.rummikubGames.updateOne({
        _id: game._id
      }, {
        $set: {
          [`players.${playerIndex}`]: player
        }
      });
    } else {
      if (game.status !== RummikubGameStatus.Lobby) {
        throw HttpError.conflict("You can only join a game while it hasn't yet started");
      }
      player = new RummikubPlayer({
        name: displayName,
        hand: [],
        socketId
      });
      await this.db.rummikubGames.updateOne({
        _id: game._id
      }, {
        $push: {
          players: player
        }
      });
    }
    return player;
  }

  async createChat(game: RummikubGame, text: string, author?: RummikubPlayer): Promise<RummikubChatMessage> {
    const message = new RummikubChatMessage({
      text,
      playerId: author ? author._id : undefined,
      createdAt: new Date()
    });
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $push: {
        chatMessages: message
      }
    });
    return message;
  }

  async start(game: RummikubGame): Promise<void> {
    if (game.players.length === 0) {
      throw HttpError.conflict("No players are in this game");
    }
    _.range(14).forEach(() => {
      for (const player of game.players) {
        game.drawCard(player);
      }
    });
    for (const player of game.players) {
      player.hand = _.sortBy(player.hand, c => c.color, c => c.value);
    }
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $set: {
        currentPlayerId: game.players[0]._id,
        players: game.players,
        status: RummikubGameStatus.InProgress
      }
    });
  }

  async nextTurn(game: RummikubGame): Promise<void> {
    const currentPlayerIndex = game.players.findIndex(p => p._id === game.currentPlayerId);
    let nextPlayerIndex = currentPlayerIndex + 1;
    if (nextPlayerIndex >= game.players.length) {
      nextPlayerIndex = 0;
    }
    const nextPlayer = game.players[nextPlayerIndex];
    game.drawCard(nextPlayer);
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $set: {
        currentPlayerId: nextPlayer._id,
        [`players.${nextPlayerIndex}.hand`]: nextPlayer.hand
      }
    });
  }

  async placeCards(game: RummikubGame, player: RummikubPlayer, { cards, boardIndex, rowIndex }: {
    cards: RummikubCard[];
    boardIndex: number;
    rowIndex: number;
  }): Promise<void> {
    if (game.currentPlayerId !== player._id) {
      throw HttpError.forbidden("It's not your turn!");
    }
    const missingCards = _.differenceBy(cards, player.hand, c => `${c.color}-${c.value}`);
    if (missingCards.length > 0) {
      throw HttpError.forbidden("You can't play cards that aren't in your hand!");
    }
    if (boardIndex >= game.board.length) {
      throw HttpError.conflict("Board index out of bounds");
    }
    // TODO validate against game rules
    if (boardIndex === -1) { // new row
      game.board.push(cards);
    } else {
      game.board[boardIndex].splice(rowIndex, 0, ...cards);
    }
    const newHand = _.differenceBy(player.hand, cards, c => `${c.color}-${c.value}`);
    const playerIndex = game.players.findIndex(p => p._id === player._id);
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $set: {
        board: game.board,
        [`players.${playerIndex}.hand`]: newHand
      }
    });
  }
}
