import axios from "axios";
import { singleton } from "tsyringe";

const STATIC_URL = "https://static.developer.riotgames.com";

@singleton()
export class LeagueService {
  private maps?: { id: number; name: string }[];

  async getMaps(): Promise<Exclude<LeagueService["maps"], undefined>> {
    if (this.maps) {
      return this.maps;
    }
    this.maps = (await axios.get<{
      mapId: number;
      mapName: string;
      notes: string;
    }[]>(`${STATIC_URL}/docs/lol/maps.json`)).data
      .map(m => ({ id: m.mapId, name: m.mapName }));
    return this.maps;
  }
}
