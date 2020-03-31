import { singleton } from "tsyringe";
import { websocketEvent, WebsocketPayload } from "../service/registry";
import { ApolloContextManager } from "../manager/apolloContext";

@singleton()
export class HelloWebsocketHandler {
  constructor(
    private apolloContextManager: ApolloContextManager
  ) { }

  @websocketEvent("hello")
  async hello({ context, data }: WebsocketPayload<any>): Promise<string> {
    const user = await context.user();
    return `Hello, ${user?.email || "anonymous user"}, you sent ${JSON.stringify(data)}`;
  }
}
