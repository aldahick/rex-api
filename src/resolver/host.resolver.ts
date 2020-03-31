import { singleton } from "tsyringe";
import { IQueryHostArgs, IQuery, IMutationCreateHostArgs, IMutation } from "../graphql/types";
import { guard } from "../manager/auth";
import { ContainerManager } from "../manager/container";
import { HostManager } from "../manager/host";
import { Host } from "../model/Host";
import { DatabaseService } from "../service/database";
import { query, resolver, mutation } from "../service/registry";

@singleton()
export class HostResolver {
  constructor(
    private containerManager: ContainerManager,
    private db: DatabaseService,
    private hostManager: HostManager
  ) { }

  @guard(can => can.read("host"))
  @query()
  async host(root: void, { id }: IQueryHostArgs): Promise<IQuery["host"]> {
    return this.hostManager.get(id);
  }

  @guard(can => can.read("host"))
  @query()
  async hosts(): Promise<IQuery["hosts"]> {
    return this.db.hosts.find();
  }

  @guard(can => can.create("host"))
  @mutation()
  async createHost(root: void, { host }: IMutationCreateHostArgs): Promise<IMutation["createHost"]> {
    return this.db.hosts.create(new Host(host));
  }

  @guard(can => can.read("container"))
  @resolver("Host.containers")
  async containers(root: Host) {
    const containers = await this.db.containers.find({
      hostId: root._id
    });
    return this.containerManager.toGqlObjects(containers, [root]);
  }
}
