import { LoggerService } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";

import { SteamPlayerManager, SteamPlayerWithGames } from "../manager/steamPlayer";
import { discordCommand, DiscordPayload } from "../registry/discord";
import { HastebinService } from "../service/hastebin";

@singleton()
export class SteamGamesCommand {
  constructor(
    private readonly hastebinService: HastebinService,
    private readonly logger: LoggerService,
    private readonly steamPlayerManager: SteamPlayerManager
  ) { }

  @discordCommand(["steamGames", "commonSteamGames"], {
    helpText: "Finds all games that given Steam users have in common."
  })
  async steamGames({ args: identifiers, command, message }: DiscordPayload): Promise<string | undefined> {
    if (!identifiers.length) {
      return `Usage: ${command} <steam usernames or ids...>`;
    }
    const steamIds = await this.steamPlayerManager.resolveUsernames(identifiers);
    let players: SteamPlayerWithGames[];
    const res = await message.reply("Gimme a second to think about it...");
    try {
      players = await this.steamPlayerManager.getMany(steamIds);
    } catch (err) {
      this.logger.error(err, "discord.steamGames");
      if (err instanceof Error) {
        await res.edit(`
An error occurred: ${err.message}
You may have given a bad user ID - make sure to use your steam ID (if your profile URL is https://steamcommunity.com/id/tiin57, give me "tiin57")
`.trim());
      }
      return;
    }
    const playersWithoutGames = players.filter(p => !p.ownedGames);
    const playersWithGames = players.filter(p => !!p.ownedGames);
    const allGames = _.flatten(playersWithGames.map(p => p.ownedGames ?? []));
    const commonGames = _.compact(_.uniq(
      allGames.map(g => g._id)
    ).map(id => ({
      id,
      count: allGames.filter(g => g._id === id).length
    })).filter(({ count }) =>
      count === playersWithGames.length
    ).map(({ id }) =>
      allGames.find(g => g._id === Number(id))
    ));
    const body = _.sortBy(
      commonGames.map(g => `* ${g.name}`),
      g => g.toLowerCase()
    ).join("\n");
    const hastebinUrl = await this.hastebinService.create(body);
    await res.edit(`
Common Steam games for ${playersWithGames.map(p => p.player.nickname).join(", ")}: ${hastebinUrl}.md
${playersWithoutGames.length ? `Some of them have their profiles set to private: ${playersWithoutGames.map(p => p.player.nickname).join(", ")}` : ""}
`.trim());
  }
}
