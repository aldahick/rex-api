import axios from "axios";
import * as cheerio from "cheerio";
import { singleton } from "tsyringe";
import { DatabaseService } from "../../service/database";
import { Progress, ProgressStatus } from "../../model/Progress";
import { WikiPage } from "../../model/WikiPage";
import { ProgressManager } from "../progress";

@singleton()
export class WikiPageManager {
  constructor(
    private db: DatabaseService,
    private progressManager: ProgressManager
  ) { }

  async fetchUntil(progress: Progress, firstPageName: string, untilPageName: string): Promise<void> {
    let lastPageName = firstPageName;
    let count = 0;
    await this.progressManager.addLogs(progress, `Fetching until "${untilPageName}", starting with "${firstPageName}"`, ProgressStatus.InProgress);
    while (lastPageName !== untilPageName) {
      try {
        const page = await this.fetchOne(lastPageName);
        await this.progressManager.addLogs(progress, `Fetched "${page.name}", next is "${page.firstLinkName}"`);
        count++;
        lastPageName = page.firstLinkName;
      } catch (err) {
        await this.progressManager.addLogs(progress, `Error: ${err.message}`, ProgressStatus.Errored);
        return;
      }
      if (lastPageName !== untilPageName) { // don't wait on the last iteration
        // wait 500ms to avoid spamming
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    await this.progressManager.addLogs(progress, `Done, fetched ${count} pages.`, ProgressStatus.Complete);
  }

  private async fetchOne(name: string): Promise<WikiPage> {
    const page = await this.db.wikiPages.findOne({ name });
    if (page) {
      return page;
    }
    const res = await axios.get(`https://en.wikipedia.org/wiki/${escape(name)}`);
    const $ = cheerio.load(res.data);
    const firstLink = $("#mw-content-text .mw-parser-output")
      .children()
      .filter((i, e) => e.tagName.toLowerCase() === "p")
      .find("a")
      .toArray()[0];
    return this.db.wikiPages.create(new WikiPage({
      name,
      // slice 2 to avoid starting /, wiki links are formatted as "/wiki/..."
      firstLinkName: firstLink.attribs.href.split("/").slice(2).join("/")
    }));
  }
}
