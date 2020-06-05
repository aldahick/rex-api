import { singleton } from "tsyringe";
import { discordCommand } from "../registry/discord";

@singleton()
export class HelloCommand {
  @discordCommand("hello")
  async hello() {
    return "hello!";
  }
}
