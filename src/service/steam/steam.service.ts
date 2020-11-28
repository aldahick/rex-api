import axios from "axios";
import { singleton } from "tsyringe";
import { resolve as resolveUrl } from "url";

import { ConfigService } from "../config";
import * as IPlayerService from "./dto/IPlayerService";
import * as ISteamUser from "./dto/ISteamUser";
import { SteamPlayer } from "./SteamPlayer";

const BASE_URL = "https://api.steampowered.com";

@singleton()
export class SteamService {
  constructor(
    private readonly config: ConfigService
  ) { }

  async getAllGames(): Promise<{ id: number; name: string }[]> {
    const url = resolveUrl(BASE_URL, "/ISteamApps/GetAppList/v2/");
    const { data } = await axios.get<{
      applist: {
        apps: {
          appid: number;
          name: string;
        }[];
      };
    }>(url);
    return data.applist.apps.map(({ appid: id, name }) => ({ id, name }));
  }

  async getPlayerSummary(steamId64: string): Promise<SteamPlayer | undefined> {
    const url = resolveUrl(BASE_URL, "/ISteamUser/GetPlayerSummaries/v2/?");
    const { data: { response: { players } } } = await axios.get<ISteamUser.GetPlayerSummaries>(url + new URLSearchParams({
      key: this.apiKey,
      steamids: steamId64
    }).toString());
    if (players.length === 0) {
      throw new Error(`no players found for steamid="${steamId64}"`);
    }
    const player = players[0];
    return player ? {
      id: player.steamid,
      nickname: player.personaname,
      avatarUrl: player.avatarfull,
      profileUrl: player.profileurl,
      playingGameId: player.gameid ? Number(player.gameid) : undefined
    } : undefined;
  }

  async getPlayerOwnedGameIds(steamId64: string): Promise<number[] | undefined> {
    const url = resolveUrl(BASE_URL, "/IPlayerService/GetOwnedGames/v0001/?");
    const { data: { response: { games } } } = await axios.get<IPlayerService.GetOwnedGames>(url + new URLSearchParams({
      key: this.apiKey,
      steamid: steamId64
    }).toString());
    return games?.map(({ appid }) => appid);
  }

  async getSteamId64FromUsername(username: string): Promise<string | undefined> {
    const url = resolveUrl(BASE_URL, "/ISteamUser/ResolveVanityURL/v0001/?");
    const { data: { response: { steamid } } } = await axios.get<ISteamUser.ResolveVanityUrl>(url + new URLSearchParams({
      key: this.apiKey,
      vanityurl: username
    }).toString());
    return steamid;
  }

  private get apiKey(): string {
    if (this.config.steamApiKey === undefined) {
      throw new Error("Missing environment variable STEAM_API_KEY");
    }
    return this.config.steamApiKey;
  }
}
