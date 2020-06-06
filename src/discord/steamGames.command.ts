import { LoggerService } from "@athenajs/core";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import { SteamPlayerManager, SteamPlayerWithGames } from "../manager/steamPlayer";
import { discordCommand, DiscordPayload } from "../registry/discord";
import { HastebinService } from "../service/hastebin";

@singleton()
export class SteamGamesCommand {
  constructor(
    private hastebinService: HastebinService,
    private logger: LoggerService,
    private steamPlayerManager: SteamPlayerManager
  ) { }

  @discordCommand("steamGames")
  async steamGames({ args: identifiers, message }: DiscordPayload) {
    const steamIds = await this.steamPlayerManager.resolveUsernames(identifiers);
    let players: SteamPlayerWithGames[];
    const res = await message.reply("Gimme a second to think about it...");
    try {
      players = await this.steamPlayerManager.getMany(steamIds);
    } catch (err) {
      this.logger.error(err, "discord.steamGames");
      return `An error occurred: ${err.message}`;
    }
    const playersWithoutGames = players.filter(p => !p.ownedGames);
    const playersWithGames = players.filter(p => !!p.ownedGames);
    const allGames = _.flatten(playersWithGames.map(p => p.ownedGames!));
    const gamesCount: {[gameId: number]: number} = {};
    for (const { _id: id } of allGames) {
      gamesCount[id] = (gamesCount[id] || 0) + 1;
    }
    const commonGames = Object.entries(gamesCount)
      .filter(([, count]) => count === players.length)
      .map(([gameId]) => allGames.find(g => g._id === Number(gameId))!);
    const body = _.sortBy(commonGames.map(g => `* ${g.name}`), g => g.toLowerCase()).join("\n");
    const hastebinUrl = await this.hastebinService.create(body);
    await res.edit(`
Common Steam games for ${playersWithGames.map(p => p.player.nickname).join(", ")}: ${hastebinUrl}.md
${playersWithoutGames.length > 0 ? `Some of them have their profiles set to private: ${playersWithoutGames.map(p => p.player.nickname).join(", ")}` : ""}
`.trim());
  }
}
