import { LoggerService } from "@athenajs/core";
import { singleton } from "tsyringe";
import { discordCommand, DiscordPayload } from "../registry/discord";
import { UltimateBraveryService } from "../service/ultimateBravery";

@singleton()
export class UltimateBraveryCommand {
  constructor(
    private readonly logger: LoggerService,
    private readonly ultimateBraveryService: UltimateBraveryService
  ) { }

  @discordCommand(["ultimateBravery", "ub"], {
    helpText: "Creates an LoL Ultimate Bravery lobby on <https://ultimate-bravery.net> with the usual options."
  })
  async ultimateBravery({ message }: DiscordPayload): Promise<void> {
    const res = await message.reply("Gimme a second to think about it...");
    try {
      const url = await this.ultimateBraveryService.createGroup({
        username: "Vulcan (leaving)",
        participantCount: 10,
        level: 10,
        isPublic: false
      });
      await res.edit(`Here there be random bullshit: <${url}>`);
    } catch (err) {
      this.logger.error(err, "discord.ultimateBravery");
      if (err instanceof Error) {
        await res.edit(`An error occurred: ${err.message}`);
      }
    }
  }
}
