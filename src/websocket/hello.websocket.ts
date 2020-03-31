import { singleton } from "tsyringe";
import { websocketEvent, WebsocketPayload } from "../service/registry";

@singleton()
export class HelloWebsocketHandler {
  @websocketEvent("hello")
  async hello({ context, data }: WebsocketPayload<any>): Promise<string> {
    const user = await context.user();
    return `Hello, ${user?.email || "anonymous user"}, you sent ${JSON.stringify(data)}`;
  }
}
