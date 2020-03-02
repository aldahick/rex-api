import { singleton } from "tsyringe";
import { query } from "../service/registry";
import { IQuery, IQueryProgressArgs } from "../graphql/types";
import { ProgressManager } from "../manager/progress";
import { guard } from "../manager/auth/guard";

@singleton()
export class ProgressResolver {
  constructor(
    private progressManager: ProgressManager
  ) { }

  @guard(can => can.read("progress"))
  @query()
  async progress(root: void, { id }: IQueryProgressArgs): Promise<IQuery["progress"]> {
    return (await this.progressManager.get(id)).toGqlObject();
  }
}
