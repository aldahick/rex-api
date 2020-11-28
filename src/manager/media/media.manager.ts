import { HttpError, LoggerService } from "@athenajs/core";
import axios, { AxiosResponse as OldAxiosResponse } from "axios";
import * as fs from "fs-extra";
import * as path from "path";
import { Readable } from "stream";
import { singleton } from "tsyringe";

import { IMediaItem, IMediaItemType } from "../../graphql/types";
import { Progress, ProgressStatus } from "../../model/Progress";
import { User } from "../../model/User";
import { ConfigService } from "../../service/config";
import { ProgressManager } from "../progress";

type AxiosResponse<T> = Omit<OldAxiosResponse<T>, "headers"> & { headers: Record<string, string> };

@singleton()
export class MediaManager {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly progressManager: ProgressManager
  ) { }

  async download({ user, url, destinationKey, progress }: {
    user: User;
    url: string;
    destinationKey: string;
    progress: Progress;
  }): Promise<void> {
    const filename = this.toFilename(user, destinationKey);
    await fs.mkdirp(path.dirname(filename));
    const { data: stream, headers } = await axios.get<Readable, AxiosResponse<Readable>>(url, { responseType: "stream" });
    const totalSize = Number(headers["content-length"]);
    let fetchedSize = 0;
    const loggedPercents = [0];
    const onLogError = (err: Error): void => {
      this.logger.error("downloadMedia.logComplete", err, { destinationKey, progressId: progress._id, url, userId: user._id });
    };
    stream.pause();
    stream.on("data", (chunk: Buffer) => {
      const percentComplete = Math.floor(fetchedSize / totalSize * 100);
      fetchedSize += chunk.byteLength;
      if (percentComplete % 10 === 0 && !loggedPercents.includes(percentComplete)) {
        this.progressManager.addLogs(progress, `${percentComplete}% complete`).catch(onLogError);
        loggedPercents.push(percentComplete);
      }
    });
    stream.pipe(fs.createWriteStream(filename));
    stream.on("end", () => {
      this.progressManager.addLogs(progress, `Finished downloading ${url} to ${destinationKey}`, ProgressStatus.completed).catch(onLogError);
    });
    await this.progressManager.addLogs(progress, "Started download", ProgressStatus.inProgress);
    stream.resume();
  }

  async list(user: User, dir: string): Promise<IMediaItem[]> {
    const baseDir = this.toFilename(user, dir);
    let files: string[];
    try {
      files = await fs.readdir(baseDir);
    } catch (err) {
      this.logger.error("media.list", err, { userId: user._id, dir });
      throw HttpError.internalError();
    }
    return Promise.all(files.filter(f => !f.startsWith(".")).map(async filename => {
      const stats = await fs.stat(path.resolve(baseDir, filename));
      return {
        key: filename.split("/").slice(-1)[0],
        type: stats.isFile() ? IMediaItemType.File :
          await fs.pathExists(path.resolve(baseDir, filename, ".series"))
            ? IMediaItemType.Series
            : IMediaItemType.Directory

      };
    }));
  }

  async getSize(user: User, key: string): Promise<number> {
    const { size } = await fs.stat(this.toFilename(user, key));
    return size;
  }

  createReadStream(user: User, key: string, { start, end }: { start: number; end?: number }): Readable {
    return fs.createReadStream(this.toFilename(user, key), { start, end });
  }

  async exists(user: User, key: string): Promise<boolean> {
    try {
      await fs.stat(this.toFilename(user, key));
      return true;
    } catch (err) {
      return false;
    }
  }

  async isFile(user: User, key: string): Promise<boolean> {
    try {
      const stats = await fs.stat(this.toFilename(user, key));
      return stats.isFile();
    } catch (err) {
      return false;
    }
  }

  private toFilename(user: User, key: string): string {
    if (this.config.mediaDir === undefined) {
      throw new Error("Missing environment variable MEDIA_DIR");
    }
    return path.resolve(this.config.mediaDir, user.email, key.replace(/^\//, "").replace(/\.\./g, ""));
  }
}
