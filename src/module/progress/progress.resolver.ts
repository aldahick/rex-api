import { guard, query } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IQuery, IQueryProgressArgs, IQueryProgressesArgs } from "../../graphql";
import { ProgressManager } from "./progress.manager";

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

  @guard({
    resource: "progress",
    action: "readAny"
  })
  @query()
  async progresses(root: unknown, { ids }: IQueryProgressesArgs): Promise<IQuery["progresses"]> {
    return (await this.progressManager.find({
      _id: {
        $in: ids
      }
    })).map(p => p.toGqlObject());
  }
}
