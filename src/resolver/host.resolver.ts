import { guard, mutation, query, resolver } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IContainer, IMutation, IMutationCreateHostArgs, IQuery, IQueryHostArgs } from "../graphql";
import { ContainerManager } from "../manager/container";
import { HostManager } from "../manager/host";
import { Host } from "../model/Host";
import { DatabaseService } from "../service/database";

@singleton()
export class HostResolver {
  constructor(
    private readonly containerManager: ContainerManager,
    private readonly db: DatabaseService,
    private readonly hostManager: HostManager
  ) { }

  @guard({
    resource: "host",
    action: "readAny"
  })
  @query()
  async host(root: unknown, { id }: IQueryHostArgs): Promise<IQuery["host"]> {
    return this.hostManager.get(id);
  }

  @guard({
    resource: "host",
    action: "readAny"
  })
  @query()
  async hosts(): Promise<IQuery["hosts"]> {
    return this.db.hosts.find();
  }

  @guard({
    resource: "host",
    action: "createAny"
  })
  @mutation()
  async createHost(root: unknown, { host }: IMutationCreateHostArgs): Promise<IMutation["createHost"]> {
    return this.db.hosts.create(new Host(host));
  }

  @guard({
    resource: "container",
    action: "readAny"
  })
  @resolver("Host.containers")
  async containers(root: Host): Promise<Omit<IContainer, "status">[]> {
    const containers = await this.db.containers.find({
      hostId: root._id
    });
    return this.containerManager.toGqlObjects(containers, [root]);
  }
}
