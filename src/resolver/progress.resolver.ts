import { guard, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IQuery, IQueryProgressArgs } from "../graphql/types";
import { ProgressManager } from "../manager/progress";

@singleton()
export class ProgressResolver {
  constructor(
    private readonly progressManager: ProgressManager
  ) { }

  @guard({
    resource: "progress",
    action: "readAny"
  })
  @query()
  async progress(root: unknown, { id }: IQueryProgressArgs): Promise<IQuery["progress"]> {
    return (await this.progressManager.get(id)).toGqlObject();
  }
}
