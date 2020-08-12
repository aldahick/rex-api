import { guard, HttpError, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationAddMediaDownloadArgs, IQuery, IQueryMediaItemsArgs } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { MediaManager } from "../manager/media";
import { ProgressManager } from "../manager/progress";

@singleton()
export class MediaResolver {
  constructor(
    private readonly mediaManager: MediaManager,
    private readonly progressManager: ProgressManager
  ) { }

  @guard({
    resource: "mediaItem",
    action: "readOwn"
  })
  @query()
  async mediaItems(root: unknown, { dir }: IQueryMediaItemsArgs, context: AuthContext): Promise<IQuery["mediaItems"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.forbidden("Requires user token");
    }
    return this.mediaManager.list(user, dir);
  }

  @guard({
    resource: "mediaItem",
    action: "createOwn"
  })
  @mutation()
  async addMediaDownload(root: unknown, { url, destinationKey }: IMutationAddMediaDownloadArgs, context: AuthContext): Promise<IMutation["addMediaDownload"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.forbidden("Requires user token");
    }
    const progress = await this.progressManager.create("addMediaDownload");
    this.progressManager.resolveSafe(progress, this.mediaManager.download({ user, url, destinationKey, progress }));
    return progress.toGqlObject();
  }
}
