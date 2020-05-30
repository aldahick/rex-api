import { HttpError } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { IRummikubGamePrivacy } from "../../graphql/types";
import { RummikubChatMessage,RummikubGame, RummikubGameStatus,RummikubPlayer } from "../../model/RummikubGame";
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

  async nextTurn(game: RummikubGame): Promise<RummikubChatMessage> {
    const currentPlayerIndex = game.players.findIndex(p => p._id === game.currentPlayerId);
    const currentPlayer = game.players[currentPlayerIndex];
    let nextPlayerIndex = currentPlayerIndex + 1;
    if (nextPlayerIndex >= game.players.length) {
      nextPlayerIndex = 0;
    }
    const allBoardCards = _.flatten(game.board);
    if (!allBoardCards.some(c => !!c.source)) {
      game.drawCard(currentPlayer);
    }
    const nextPlayer = game.players[nextPlayerIndex];
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $set: {
        currentPlayerId: nextPlayer._id,
        [`players.${currentPlayerIndex}.hand`]: currentPlayer.hand,
      }
    });
    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $unset: {
        "board.$[].$[].source": ""
      }
    });
    return this.createChat(game, `It's ${nextPlayer.name}'s turn!`);
  }

  async placeCard(game: RummikubGame, player: RummikubPlayer, {
    fromRowIndex, fromCardIndex, toRowIndex, toCardIndex
  }: {
    fromRowIndex?: number;
    fromCardIndex: number;
    toRowIndex?: number;
    toCardIndex: number;
  }): Promise<RummikubChatMessage | undefined> {
    if (game.currentPlayerId !== player._id) {
      throw HttpError.forbidden("It's not your turn!");
    }
    const getRow = (rowIndex?: number) => {
      if (rowIndex === -1) {
        game.board.push([]);
        return game.board[game.board.length - 1];
      }
      if (rowIndex === undefined) {
        return player.hand;
      }
      if (rowIndex >= 0 && rowIndex < game.board.length) {
        return game.board[rowIndex];
      }
      throw new Error(`Row index out of bounds: ${rowIndex}`);
    };

    const fromRow = getRow(fromRowIndex);
    const toRow = getRow(toRowIndex);

    const [card] = fromRow.splice(fromCardIndex, 1);
    // if put from hand onto board
    if (toRowIndex !== undefined && fromRowIndex === undefined) {
      card.source = {
        rowIndex: fromRowIndex,
        cardIndex: fromCardIndex
      };
    } else if (toRowIndex === undefined) {
      card.source = undefined;
    }
    toRow.splice(toCardIndex, 0, card);

    const playerIndex = game.players.findIndex(p => p._id === player._id);

    await this.db.rummikubGames.updateOne({
      _id: game._id
    }, {
      $set: {
        board: game.board,
        [`players.${playerIndex}.hand`]: player.hand
      }
    });

    // don't send chat if they're just rearranging something
    if (fromRowIndex === toRowIndex) {
      return undefined;
    }
    const destinationText = toRowIndex === -1
      ? "in a new row"
      : toRowIndex === undefined ? "in their hand" : "on the board";
    return this.createChat(game, `${player.name} placed ${card.color}-${card.value} ${destinationText}`);
  }
}
