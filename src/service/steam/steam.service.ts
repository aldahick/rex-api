import * as url from "url";
import axios from "axios";
import { singleton } from "tsyringe";

const BASE_URL = "https://api.steampowered.com";

@singleton()
export class SteamService {
  async getAllGames(): Promise<{ id: number; name: string }[]> {
    const { data } = await axios.get<{ applist: { apps: any[] } }>(url.resolve(BASE_URL, "/ISteamApps/GetAppList/v2/"));
    return data.applist.apps.map(({ appid, name }) => ({ id: appid, name }));
  }
}
