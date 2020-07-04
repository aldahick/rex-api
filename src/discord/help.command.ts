import { singleton } from "tsyringe";
import { discordCommand,DiscordRegistry } from "../registry/discord";
import { ConfigService } from "../service/config";

@singleton()
export class HelpCommand {
  constructor(
    private config: ConfigService,
    private discordRegistry: DiscordRegistry
  ) { }

  @discordCommand("help", {
    helpText: "Don't read this."
  })
  async help() {
    /*
    ends up like:
    **Commands:**
    `~a`, `~b`: this is help text
    `~c`: and this is more
    */
    return `**Commands:**\n${
      this.discordRegistry.commandMetadatas
        .map(({ commands, helpText }) => `${commands
          .map(command => `\`${this.config.discord.commandPrefix}${command}\``)
          .join(", ")
        }: ${helpText}`)
        .join("\n")
    }`;
  }
}
