import * as url from "url";
import { ConfigService } from "../config";
import * as IPlayerService from "./dto/IPlayerService";
import * as ISteamUser from "./dto/ISteamUser";
import { singleton } from "tsyringe";
import axios from "axios";

const BASE_URL = "https://api.steampowered.com";

@singleton()
export class SteamService {
  constructor(
    private config: ConfigService
  ) { }

  async getAllGames(): Promise<{ id: number; name: string }[]> {
    const { data } = await axios.get<{ applist: { apps: any[] } }>(url.resolve(BASE_URL, "/ISteamApps/GetAppList/v2/"));
    return data.applist.apps.map(({ appid, name }) => ({ id: appid, name }));
  }

  async getPlayerSummary(steamId64: string): Promise<{
    id: string;
    nickname: string;
    avatarUrl: string;
    profileUrl: string;
    playingGameId?: number;
  }> {
    const { data: { response: { players } } } = await axios.get<ISteamUser.GetPlayerSummaries>(url.resolve(BASE_URL, `/ISteamUser/GetPlayerSummaries/v2/?${new URLSearchParams({
      key: this.config.steamApiKey,
      steamids: steamId64
    })}`));
    if (players.length === 0) {
      throw new Error(`no players found for steamid="${steamId64}"`);
    }
    const player = players[0];
    return {
      id: player.steamid,
      nickname: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
      playingGameId: player.gameid ? Number(player.gameid) : undefined
    };
  }

  async getPlayerOwnedGameIds(steamId64: string): Promise<number[]> {
    const { data: { response: { games } } } = await axios.get<IPlayerService.GetOwnedGames>(url.resolve(BASE_URL, `/IPlayerService/GetOwnedGames/v0001/?${new URLSearchParams({
      key: this.config.steamApiKey,
      steamid: steamId64
    })}`));
    return games.map(({ appid }) => appid);
  }
}
