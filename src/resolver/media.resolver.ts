import { singleton } from "tsyringe";
import { MediaManager } from "../manager/media";
import { query } from "../service/registry";
import { IQuery, IQueryMediaItemsArgs } from "../graphql/types";
import { guard } from "../manager/auth/guard";
import { ApolloContext } from "../manager/apolloContext";
import { HttpError } from "../util/HttpError";

@singleton()
export class MediaResolver {
  constructor(
    private mediaManager: MediaManager
  ) { }

  @guard(can => can.read("mediaItem"))
  @query()
  async mediaItems(root: void, { dir }: IQueryMediaItemsArgs, context: ApolloContext): Promise<IQuery["mediaItems"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.forbidden("Requires user token");
    }
    return this.mediaManager.list(user, dir);
  }
}
