import { HttpError, WebsocketRegistry } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IRummikubServerBoardPayload, IRummikubServerChatPayload, IRummikubServerHandPayload, IRummikubServerPlayersPayload, IRummikubServerTurnPayload } from "../../graphql";
import { RummikubChatMessage, RummikubGame, RummikubPlayer } from "../../model/RummikubGame";
import { RummikubGameManager } from "./rummikubGame.manager";

type WebsocketWithGame = SocketIO.Socket & {
  rummikubGameId?: string;
  rummikubPlayerId?: string;
};

@singleton()
export class RummikubSocketManager {
  private get io(): SocketIO.Server {
    return this.websocketRegistry.io;
  }

  constructor(
    private readonly rummikubGameManager: RummikubGameManager,
    private readonly websocketRegistry: WebsocketRegistry
  ) { }

  async setGameId(socket: WebsocketWithGame, gameId: string): Promise<void> {
    socket.rummikubGameId = gameId;
    const room = this.getRoom({ _id: gameId } as RummikubGame);
    await new Promise((resolve, reject) => {
      socket.join(room, err => err !== undefined ? reject(err) : resolve());
    });
  }

  getGameId(socket: WebsocketWithGame): string {
    const gameId = socket.rummikubGameId;
    if (gameId === undefined) {
      throw HttpError.forbidden("You are not in a game");
    }
    return gameId;
  }

  async getGame(socket: SocketIO.Socket): Promise<RummikubGame> {
    const gameId = this.getGameId(socket);
    const game = await this.rummikubGameManager.get(gameId);
    return game;
  }

  setPlayerId(socket: WebsocketWithGame, playerId: string): void {
    socket.rummikubPlayerId = playerId;
  }

  getPlayerId(socket: WebsocketWithGame): string {
    const playerId = socket.rummikubPlayerId;
    if (playerId === undefined) {
      throw HttpError.forbidden("You are not in a game");
    }
    return playerId;
  }

  async getPlayer(socket: SocketIO.Socket, game?: RummikubGame): Promise<RummikubPlayer> {
    const playerId = this.getPlayerId(socket);
    const player = (game ?? await this.getGame(socket)).players.find(p => p._id === playerId);
    if (!player) {
      throw HttpError.notFound(`player id=${playerId}`);
    }
    return player;
  }

  sendStart(game: RummikubGame): void {
    this.sendAllHands(game);
    this.sendTurn(game);
  }

  sendBoard(game: RummikubGame, socket?: SocketIO.Socket): void {
    const payload: IRummikubServerBoardPayload = {
      board: game.board
    };
    if (socket) {
      socket.emit("rummikub.server.board", payload);
    } else {
      this.sendToGame<IRummikubServerBoardPayload>(game, "rummikub.server.board", payload);
    }
  }

  sendChat(game: RummikubGame, message: RummikubChatMessage): void {
    this.sendToGame<IRummikubServerChatPayload>(game, "rummikub.server.chat", {
      id: message._id,
      message: message.text,
      createdAt: message.createdAt.toISOString(),
      author: message.playerId !== undefined
        ? game.players.find(p => p._id === message.playerId)
        : undefined
    });
  }

  async sendHand(socket: SocketIO.Socket): Promise<void> {
    const payload: IRummikubServerHandPayload = {
      hand: (await this.getPlayer(socket)).hand
    };
    socket.emit("rummikub.server.hand", payload);
  }

  sendAllHands(game: RummikubGame): void {
    this.sendToGameEach<IRummikubServerHandPayload>(
      game,
      "rummikub.server.hand",
      ({ hand }) => ({ hand })
    );
  }

  sendPlayers(game: RummikubGame): void {
    const players = game.players.filter(p => this.isConnected(p)).map(p => ({
      _id: p._id,
      name: p.name
    }));
    this.sendToGameEach<IRummikubServerPlayersPayload>(game, "rummikub.server.players", player => ({
      players,
      self: player
    }));
  }

  sendTurn(game: RummikubGame): void {
    const player = game.players.find(p => p._id === game.currentPlayerId);
    if (!player) {
      throw HttpError.notFound(`player id=${game.currentPlayerId ?? "undefined"}`);
    }
    this.sendToGame<IRummikubServerTurnPayload>(game, "rummikub.server.turn", {
      player
    });
    this.sendAllHands(game);
  }

  sendToGame<Payload>(game: RummikubGame, eventName: string, payload: Payload): void {
    this.io.to(this.getRoom(game)).emit(eventName, payload);
  }

  sendToGameEach<Payload>(game: RummikubGame, eventName: string, payload: (player: RummikubPlayer) => Payload): void {
    for (const player of game.players) {
      this.io.to(player.socketId).emit(eventName, payload(player));
    }
  }

  getRoom(game: RummikubGame): string {
    return `rummikub.game.${game._id}`;
  }

  isConnected(player: RummikubPlayer): boolean {
    return this.io.sockets.connected[player.socketId].connected;
  }
}
