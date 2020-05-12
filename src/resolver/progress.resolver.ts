import { singleton } from "tsyringe";
import { guard, query } from "@athenajs/core";
import { IQuery, IQueryProgressArgs } from "../graphql/types";
import { ProgressManager } from "../manager/progress";

@singleton()
export class ProgressResolver {
  constructor(
    private progressManager: ProgressManager
  ) { }

  @guard({
    resource: "progress",
    action: "readAny"
  })
  @query()
  async progress(root: void, { id }: IQueryProgressArgs): Promise<IQuery["progress"]> {
    return (await this.progressManager.get(id)).toGqlObject();
  }
}
