import { singleton } from "tsyringe";
import { discordCommand, DiscordRegistry } from "../registry/discord";
import { ConfigService } from "../service/config";

@singleton()
export class HelpCommand {
  constructor(
    private readonly config: ConfigService,
    private readonly discordRegistry: DiscordRegistry
  ) { }

  @discordCommand("help", {
    helpText: "Don't read this."
  })
  help(): string {
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
