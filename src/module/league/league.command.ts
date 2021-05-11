import { LoggerService } from "@athenajs/core";
import { Message } from "discord.js";
import { singleton } from "tsyringe";

import { discordCommand, DiscordPayload } from "../../registry/discord";
import { ConfigService } from "../../service/config";
import { LeagueManager } from "./league.manager";

@singleton()
export class LeagueCommand {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly leagueManager: LeagueManager
  ) { }

  @discordCommand(["league", "lol", "ub", "ultimateBravery"], {
    helpText: "Do things with League of Legends"
  })
  async league({ args, command, message }: DiscordPayload): Promise<string | undefined> {
    if (["ub", "ultimatebravery"].some(c => command.toLowerCase().endsWith(c)) || args[0]?.toLowerCase() === "ub") {
      await this.createUltimateBravery(message);
      return;
    }
    return `Unknown subcommand, try \`${this.config.discord.commandPrefix}league ub\` to create an Ultimate Bravery game.`;
  }

  private async createUltimateBravery(message: Message): Promise<void> {
    const response = await message.reply("Creating lobby...");
    try {
      const url = await this.leagueManager.createUltimateBravery();
      await response.edit(`Here's your lobby, @<${message.author.id}>: <${url}>`);
    } catch (err) {
      this.logger.error(err, "discord.league.ultimateBravery");
      if (err instanceof Error) {
        await response.edit(`An error occurred: ${err.message}`);
      }
    }
  }
}
