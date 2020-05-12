import { singleton } from "tsyringe";
import { guard, query, mutation, HttpError } from "@athenajs/core";
import { MediaManager } from "../manager/media";
import { IQuery, IQueryMediaItemsArgs, IMutationAddMediaDownloadArgs, IMutation } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { ProgressManager } from "../manager/progress";

@singleton()
export class MediaResolver {
  constructor(
    private mediaManager: MediaManager,
    private progressManager: ProgressManager
  ) { }

  @guard({
    resource: "mediaItem",
    action: "readOwn"
  })
  @query()
  async mediaItems(root: void, { dir }: IQueryMediaItemsArgs, context: AuthContext): Promise<IQuery["mediaItems"]> {
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
