import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { Progress, ProgressLog,ProgressStatus } from "../../model/Progress";
import { DatabaseService } from "../../service/database";

@singleton()
export class ProgressManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<Progress> {
    const progress = await this.db.progress.findById(id);
    if (!progress) {
      throw HttpError.notFound(`progress id=${id} not found`);
    }
    return progress;
  }

  async create(action: string): Promise<Progress> {
    return this.db.progress.create(new Progress({
      action,
      createdAt: new Date(),
      status: ProgressStatus.Created,
      logs: []
    }));
  }

  async addLogs(progress: Progress, logs: string | string[], status?: ProgressStatus) {
    await this.db.progress.updateOne({
      _id: progress._id
    }, {
      $push: {
        logs: {
          $each: (logs instanceof Array ? logs : [logs]).map(text => new ProgressLog({
            text,
            createdAt: new Date()
          }))
        }
      }
    });
    if (status) {
      await this.db.progress.updateOne({
        _id: progress._id
      }, {
        $set: {
          status
        }
      });
    }
  }

  resolveSafe(progress: Progress, promise: Promise<void>) {
    promise.catch(async err => {
      await this.addLogs(progress, `An unexpected error occurred: ${err.message}`);
    });
  }
}
