import { LoggerService } from "@athenajs/core";
import * as Gamedig from "gamedig";
import * as _ from "lodash";
import * as pluralize from "pluralize";
import { singleton } from "tsyringe";
import * as url from "url";
import { discordCommand, DiscordPayload } from "../registry/discord";

@singleton()
export class PlayersCommand {
  constructor(
    private readonly logger: LoggerService
  ) { }

  @discordCommand("players", {
    helpText: "Tells you who's playing on a given server IP (works with lots of games)."
  })
  async players({ args: [serverUrl], command, message }: DiscordPayload): Promise<string | undefined> {
    if (!serverUrl) {
      return `Usage: ${command} <game>://<host>:[port] (example: ${command} minecraft://tiin57.net:25565) (port is not required)`;
    }
    const { protocol, hostname, port } = url.parse(serverUrl);
    if (protocol === null || hostname === null) {
      return "I don't know how to ping that URL.";
    }
    const res = await message.reply("Gimme a second to think about it...");
    let players: Gamedig.QueryResult["players"];
    try {
      players = await Gamedig.query({
        type: protocol.replace(/\:$/, "") as Gamedig.Type,
        host: hostname,
        port: Number(port),
      }).then(r => r.players);
    } catch (err) {
      this.logger.error(err, { serverUrl }, "discord.players");
      await res.edit(err instanceof Error ? err.message : err);
      return;
    }
    const playerNames = _.sortBy(players.map(p => p.name ?? ""), n => n.toLowerCase()).filter(n => !!n.trim());
    await res.edit(`
There are ${playerNames.length} ${pluralize("player", playerNames.length)} on ${serverUrl}${players.length ? ":" : "."} ${playerNames.join(", ")}
`.trim());
  }
}
