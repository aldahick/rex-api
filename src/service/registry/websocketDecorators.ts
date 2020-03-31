import { AuthContext } from "../../manager/auth";

export interface WebsocketPayload<T> {
  socket: SocketIO.Socket;
  data: T;
  context: AuthContext;
}

export const websocketEvent = (name: string) => (target: any, key: string) => {
  Reflect.defineMetadata("websocketEvent", { name }, target, key);
};
