import { guard, websocketEvent, WebsocketPayload } from "@athenajs/core";
import { singleton } from "tsyringe";

@singleton()
export class GarageDoorWebsocketHandler {
  @guard({
    resource: "garageDoor",
    action: "readAny"
  })
  @websocketEvent("garageDoors.join")
  onJoinGarageDoors({ socket }: WebsocketPayload<unknown>): void {
    socket.join("garageDoors");
  }
}
