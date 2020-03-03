import * as path from "path";
import { Readable } from "stream";
import * as fs from "fs-extra";
import { singleton } from "tsyringe";
import { IMediaItem, IMediaItemType } from "../../graphql/types";
import { User } from "../../model/User";
import { ConfigService } from "../../service/config";
import { HttpError } from "../../util/HttpError";
import { LoggerService } from "../../service/logger";

@singleton()
export class MediaManager {
  constructor(
    private config: ConfigService,
    private logger: LoggerService
  ) { }

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
        type: stats.isFile() ? IMediaItemType.File : (
          await fs.pathExists(path.resolve(baseDir, filename, ".series"))
            ? IMediaItemType.Series
            : IMediaItemType.Directory
        )
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

  async exists(user: User, key: string): Promise<{ isFile?: boolean }> {
    try {
      const stats = await fs.stat(this.toFilename(user, key));
      // console.log(stats.isFile());
      return { isFile: stats.isFile() };
    } catch (err) {
      return { };
    }
  }

  private toFilename(user: User, key: string): string {
    return path.resolve(this.config.mediaDir, user.email, key.replace(/^\//, "").replace(/\.\./g, ""));
  }
}
