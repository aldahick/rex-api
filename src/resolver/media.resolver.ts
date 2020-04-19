import { singleton } from "tsyringe";
import { MediaManager } from "../manager/media";
import { query, mutation } from "../service/registry";
import { IQuery, IQueryMediaItemsArgs, IMutationAddMediaDownloadArgs, IMutation } from "../graphql/types";
import { HttpError } from "../util/HttpError";
import { AuthContext, guard } from "../manager/auth";
import { ProgressManager } from "../manager/progress";

@singleton()
export class MediaResolver {
  constructor(
    private mediaManager: MediaManager,
    private progressManager: ProgressManager
  ) { }

  @guard(can => can.read("mediaItem"))
  @query()
  async mediaItems(root: void, { dir }: IQueryMediaItemsArgs, context: AuthContext): Promise<IQuery["mediaItems"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.forbidden("Requires user token");
    }
    return this.mediaManager.list(user, dir);
  }

  @guard(can => can.create("mediaItem"))
  @mutation()
  async addMediaDownload(root: void, { url, destinationKey }: IMutationAddMediaDownloadArgs, context: AuthContext): Promise<IMutation["addMediaDownload"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.forbidden("Requires user token");
    }
    const progress = await this.progressManager.create("addMediaDownload");
    this.progressManager.resolveSafe(progress, this.mediaManager.download({ user, url, destinationKey, progress }));
    return progress.toGqlObject();
  }
}
