import { singleton } from "tsyringe";

import { UltimateBraveryService } from "../../service/ultimateBravery";

@singleton()
export class LeagueManager {
  constructor(
    private readonly ultimateBraveryService: UltimateBraveryService
  ) { }

  createUltimateBravery(): Promise<string> {
    return this.ultimateBraveryService.createLobby({
      username: "Vulcan Bot",
      regionId: "NA1",
      mapId: 12,
      size: 10,
      level: 10,
      isPublic: false
    });
  }
}
