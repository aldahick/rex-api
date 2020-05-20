import { guard } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation,IMutationFetchWikiPagesUntilArgs } from "../graphql/types";
import { ProgressManager } from "../manager/progress";
import { WikiPageManager } from "../manager/wikiPage";

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
