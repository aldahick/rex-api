import { singleton } from "tsyringe";
import { discordCommand } from "../registry/discord";

@singleton()
export class HelloCommand {
  @discordCommand("hello", {
    helpText: "This is pretty simple."
  })
  async hello() {
    return "hello!";
  }
}
