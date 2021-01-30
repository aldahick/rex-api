import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IProgressStatus } from "../../graphql";
import { DatabaseService } from "../../service/database";
import { Progress, ProgressLog } from "./model";

@singleton()
export class ProgressManager {
  constructor(
    private readonly db: DatabaseService
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
      status: IProgressStatus.Created,
      logs: []
    }));
  }

  async addLogs(progress: Progress, logs: string | string[], status?: IProgressStatus): Promise<void> {
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
    if (status !== undefined) {
      await this.db.progress.updateOne({
        _id: progress._id
      }, {
        $set: {
          status
        }
      });
    }
  }

  resolveSafe(progress: Progress, promise: Promise<void>): void {
    promise.catch(async (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : err as string;
      await this.addLogs(progress, `An unexpected error occurred: ${errorMessage}`);
    });
  }
}
