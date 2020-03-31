import { singleton } from "tsyringe";
import { MediaManager } from "../manager/media";
import { query } from "../service/registry";
import { IQuery, IQueryMediaItemsArgs } from "../graphql/types";
import { HttpError } from "../util/HttpError";
import { AuthContext, guard } from "../manager/auth";

@singleton()
export class MediaResolver {
  constructor(
    private mediaManager: MediaManager
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
}
