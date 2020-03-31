import { ApolloContext } from "../../manager/apolloContext";

export interface WebsocketPayload<T> {
  socket: SocketIO.Socket;
  data: T;
  context: ApolloContext;
}

export const websocketEvent = (name: string) => (target: any, key: string) => {
  Reflect.defineMetadata("websocketEvent", { name }, target, key);
};
