import * as http from "http";
import * as socketIO from "socket.io";
import { singleton } from "tsyringe";
import { findDecoratedMethods } from "../../util/findDecoratedMethods";
import { LoggerService } from "../logger";
import { AuthManager } from "../../manager/auth";
import { WebsocketPayload } from "./websocketDecorators";

@singleton()
export class WebsocketRegistryService {
  private io?: SocketIO.Server;

  private eventHandlers: {
    [key: string]: ((payload: WebsocketPayload<any>) => Promise<any>)[];
  } = {};

  constructor(
    private authManager: AuthManager,
    private logger: LoggerService
  ) { }

  async init(httpServer: http.Server, websocketTargets: any[]) {
    this.io = socketIO(httpServer);

    const metadatas = findDecoratedMethods<{ name: string }, any>(websocketTargets, "websocketEvent");
    metadatas.forEach(({ target, key, name }) => {
      if (!this.eventHandlers[name]) {
        this.eventHandlers[name] = [];
      }
      this.eventHandlers[name].push(target[key].bind(target));
    });

    this.io.on("connection", this.onConnection);
  }

  private onConnection = (socket: SocketIO.Socket) => {
    const context = this.authManager.buildContext(socket.request);
    for (const eventName of Object.keys(this.eventHandlers)) {
      socket.on(eventName, data => {
        for (const eventHandler of this.eventHandlers[eventName]) {
          eventHandler({ socket, data, context }).then(res => {
            if (res !== undefined) {
              socket.emit(eventName, res);
            }
          }).catch(err => {
            this.logger.error("websocket.eventHandler", err, { eventName, data });
          });
        }
      });
    }
  };
}
