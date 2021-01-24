import * as _ from "lodash";
import { singleton } from "tsyringe";

import { Progress, ProgressStatus } from "../../model/Progress";
import { SteamGame } from "../../model/SteamGame";
import { DatabaseService } from "../../service/database";
import { SteamService } from "../../service/steam";
import { ProgressManager } from "../progress";

const FETCH_CHUNK_SIZE = 1000;

@singleton()
export class SteamGameManager {
  constructor(
    private readonly db: DatabaseService,
    private readonly progressManager: ProgressManager,
    private readonly steamService: SteamService
  ) { }

  getMany(ids: number[]): Promise<SteamGame[]> {
    return this.db.steamGames.find({
      _id: { $in: ids }
    }).exec();
  }

  async fetchAll(progress: Progress): Promise<void> {
    await this.progressManager.addLogs(progress, "Deleting all previous games...", ProgressStatus.inProgress);
    await this.db.steamGames.deleteMany({});
    await this.progressManager.addLogs(progress, "Fetching games...");
    const allGames = await this.steamService.getAllGames();
    const gameChunks = _.chunk(allGames, FETCH_CHUNK_SIZE);
    for (let i = 0; i < gameChunks.length; i++) {
      await this.progressManager.addLogs(progress, `Saving game chunk ${i}/${gameChunks.length}...`);
      await this.db.steamGames.create(gameChunks[i].map(game => new SteamGame({
        _id: game.id,
        name: game.name
      })));
    }
    await this.progressManager.addLogs(progress, `Finished inserting ${allGames.length} games.`, ProgressStatus.completed);
  }

  async search(text: string, { offset, limit }: { offset: number; limit: number }): Promise<SteamGame[]> {
    return this.db.steamGames.aggregate([
      {
        $match: {
          name: new RegExp(text, "i")
        },
      },
      { $skip: offset },
      { $limit: limit },
      { $sort: { name: 1 } }
    ]);
  }
}
