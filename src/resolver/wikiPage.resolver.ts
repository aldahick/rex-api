import { singleton } from "tsyringe";
import { guard } from "@athenajs/core";
import { IMutationFetchWikiPagesUntilArgs, IMutation } from "../graphql/types";
import { WikiPageManager } from "../manager/wikiPage";
import { ProgressManager } from "../manager/progress";

@singleton()
export class WikiPageResolver {
  constructor(
    private progressManager: ProgressManager,
    private wikiPageManager: WikiPageManager
  ) { }

  @guard({
    resource: "wikiPage",
    action: "createAny"
  })
  async fetchWikiPagesUntil(root: void, { firstPageName, untilPageName }: IMutationFetchWikiPagesUntilArgs): Promise<IMutation["fetchWikiPagesUntil"]> {
    const progress = await this.progressManager.create("fetchWikiPagesUntil");
    this.progressManager.resolveSafe(progress, this.wikiPageManager.fetchUntil(progress, firstPageName, untilPageName));
    return progress.toGqlObject();
  }
}
