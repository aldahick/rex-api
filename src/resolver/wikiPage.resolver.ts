import { singleton } from "tsyringe";
import { mutation } from "../service/registry";
import { IMutationFetchWikiPagesUntilArgs, IMutation } from "../graphql/types";
import { guard } from "../manager/auth";
import { WikiPageManager } from "../manager/wikiPage";
import { ProgressManager } from "../manager/progress";

@singleton()
export class WikiPageResolver {
  constructor(
    private progressManager: ProgressManager,
    private wikiPageManager: WikiPageManager
  ) { }

  @guard(can => can.create("wikiPage"))
  @mutation()
  async fetchWikiPagesUntil(root: void, { firstPageName, untilPageName }: IMutationFetchWikiPagesUntilArgs): Promise<IMutation["fetchWikiPagesUntil"]> {
    const progress = await this.progressManager.create("fetchWikiPagesUntil");
    this.progressManager.resolveSafe(progress, this.wikiPageManager.fetchUntil(progress, firstPageName, untilPageName));
    return progress.toGqlObject();
  }
}
