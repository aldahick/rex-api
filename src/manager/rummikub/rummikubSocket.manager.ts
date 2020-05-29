import { HttpError, WebsocketRegistry } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IRummikubServerBoardPayload, IRummikubServerChatPayload,IRummikubServerHandPayload,IRummikubServerPlayersPayload, IRummikubServerTurnPayload } from "../../graphql/types";
import { RummikubChatMessage,RummikubGame, RummikubPlayer } from "../../model/RummikubGame";
import { RummikubGameManager } from "./rummikubGame.manager";

@singleton()
export class RummikubSocketManager {
  private io: SocketIO.Server;

  constructor(
    private rummikubGameManager: RummikubGameManager,
    websocketRegistry: WebsocketRegistry
  ) {
    this.io = websocketRegistry.io;
  }

  async setGameId(socket: SocketIO.Socket, gameId: string): Promise<void> {
    (socket as any).rummikubGameId = gameId;
    const room = this.getRoom({ _id: gameId } as RummikubGame);
    await new Promise((resolve, reject) => {
      socket.join(room, err => err ? reject(err) : resolve());
    });
  }

  getGameId(socket: SocketIO.Socket): string {
    const gameId = (socket as any).rummikubGameId;
    if (!gameId) {
      throw HttpError.forbidden("You are not in a game");
    }
    return gameId;
  }

  async getGame(socket: SocketIO.Socket): Promise<RummikubGame> {
    const gameId = this.getGameId(socket);
    const game = await this.rummikubGameManager.get(gameId);
    return game;
  }

  setPlayerId(socket: SocketIO.Socket, playerId: string): void {
    (socket as any).rummikubPlayerId = playerId;
  }

  getPlayerId(socket: SocketIO.Socket): string {
    const playerId = (socket as any).rummikubPlayerId;
    if (!playerId) {
      throw HttpError.forbidden("You are not in a game");
    }
    return playerId;
  }

  async getPlayer(socket: SocketIO.Socket, game?: RummikubGame): Promise<RummikubPlayer> {
    const playerId = this.getPlayerId(socket);
    const player = (game || await this.getGame(socket)).players.find(p => p._id === playerId);
    if (!player) {
      throw HttpError.notFound(`player id=${playerId}`);
    }
    return player;
  }

  async sendStart(game: RummikubGame) {
    for (const player of game.players) {
      const payload: IRummikubServerHandPayload = {
        hand: player.hand
      };
      this.io.to(player.socketId).emit("rummikub.server.hand", payload);
    }
  }

  sendBoard(game: RummikubGame) {
    this.sendToGame<IRummikubServerBoardPayload>(game, "rummikub.server.board", {
      board: game.board
    });
  }

  sendChat(game: RummikubGame, message: RummikubChatMessage) {
    this.sendToGame<IRummikubServerChatPayload>(game, "rummikub.server.chat", {
      message: message.text,
      createdAt: message.createdAt,
      author: message.playerId ? game.players.find(p => p._id === message.playerId) : undefined
    });
  }

  async sendHand(socket: SocketIO.Socket): Promise<void> {
    const payload: IRummikubServerHandPayload = {
      hand: (await this.getPlayer(socket)).hand
    };
    socket.emit("rummikub.server.hand", payload);
  }

  sendPlayers(game: RummikubGame) {
    this.sendToGame<IRummikubServerPlayersPayload>(game, "rummikub.server.players", {
      players: game.players.map(p => ({
        _id: p._id,
        name: p.name
      }))
    });
  }

  sendTurn(game: RummikubGame) {
    const player = game.players.find(p => p._id === game.currentPlayerId);
    if (!player) {
      throw HttpError.notFound(`player id=${game.currentPlayerId}`);
    }
    this.sendToGame<IRummikubServerTurnPayload>(game, "rummikub.server.turn", {
      player
    });
  }

  sendToGame<Payload>(game: RummikubGame, eventName: string, payload: Payload) {
    this.io.to(this.getRoom(game)).emit(eventName, payload);
  }

  getRoom(game: RummikubGame) {
    return `rummikub.game.${game._id}`;
  }
}
