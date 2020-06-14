import { LoggerService } from "@athenajs/core";
import * as Gamedig from "gamedig";
import * as _ from "lodash";
import { singleton } from "tsyringe";
import * as url from "url";
import { discordCommand, DiscordPayload } from "../registry/discord";

@singleton()
export class PlayersCommand {
  constructor(
    private logger: LoggerService
  ) { }

  @discordCommand("players")
  async players({ args: [serverUrl], message }: DiscordPayload) {
    const { protocol, hostname, port } = url.parse(serverUrl);
    if (!protocol || !hostname) {
      return "I don't know how to ping that URL.";
    }
    const res = await message.reply("Gimme a second to think about it...");
    let players: Gamedig.QueryResult["players"];
    try {
      players = await Gamedig.query({
        type: protocol.replace(/\:$/, "") as any,
        host: hostname,
        port: Number(port),
      }).then(r => r.players);
    } catch (err) {
      this.logger.error(err, { serverUrl }, "discord.players");
      await res.edit(err.message);
      return;
    }
    const playerNames = _.sortBy(players.map(p => p.name || ""), n => n.toLowerCase()).filter(n => !!n.trim());
    await res.edit(`
There are ${players.length} players on ${serverUrl}${players.length > 0 ? ":" : "."} ${playerNames.join(", ")}
`.trim());
  }
}
