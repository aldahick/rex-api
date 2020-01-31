import { singleton } from "tsyringe";
import { query, mutation, resolver } from "../service/registry";
import { IQueryContainerArgs, IQuery, IMutation, IMutationCreateContainerArgs, IMutationUpdateContainerPortsArgs, IMutationSetContainerVariableArgs, IMutationRemoveContainerVariableArgs, IContainerStatus, IContainer, IMutationDeleteContainersArgs } from "../graphql/types";
import { guard } from "../manager/auth/guard";
import { DatabaseService } from "../service/database";
import { ContainerManager } from "../manager/container";
import { HostManager } from "../manager/host";
import { Container } from "../model/Container";

@singleton()
export class ContainerResolver {
  constructor(
    private containerManager: ContainerManager,
    private db: DatabaseService,
    private hostManager: HostManager
  ) { }

  @guard(can => can.read("container"))
  @query()
  async container(root: void, { id }: IQueryContainerArgs): Promise<IQuery["container"]> {
    const container = await this.containerManager.get(id);
    const host = await this.hostManager.get(container.hostId);
    return {
      ...container,
      host,
      status: IContainerStatus.Running
    };
  }

  @guard(can => can.read("container"))
  @query()
  async containers(): Promise<IQuery["containers"]> {
    const containers = await this.db.containers.find();
    const hosts = await this.db.hosts.find({
      _id: { $in: containers.map(c => c.hostId) }
    });
    return this.containerManager.toGqlObjects(containers, hosts);
  }

  @guard(can => can.create("container"))
  @mutation()
  async createContainer(root: void, { container }: IMutationCreateContainerArgs): Promise<IMutation["createContainer"]> {
    const host = await this.hostManager.get(container.hostId);
    const created = await this.db.containers.create(new Container({
      ...container,
      ports: [],
      variables: []
    }));
    return this.containerManager.toGqlObjects([created], [host])[0];
  }

  @guard(can => can.delete("container"))
  @mutation()
  async deleteContainers(root: void, { ids }: IMutationDeleteContainersArgs): Promise<IMutation["deleteContainers"]> {
    await this.db.containers.deleteMany({
      _id: { $in: ids }
    });
    return true;
  }

  // @guard(can => can.update("container"))
  // @mutation()
  // async updateContainerPorts(root: void, args: IMutationUpdateContainerPortsArgs): Promise<IMutation["updateContainerPorts"]> {

  // }

  // @guard(can => can.update("container"))
  // @mutation()
  // async setContainerVariable(root: void, args: IMutationSetContainerVariableArgs): Promise<IMutation["setContainerVariable"]> {

  // }

  // @guard(can => can.update("container"))
  // @mutation()
  // async removeContainerVariable(root: void, args: IMutationRemoveContainerVariableArgs): Promise<IMutation["removeContainerVariable"]> {
  // }

  @guard(can => can.read("host"))
  @resolver("Container.host")
  host(root: IContainer) {
    return root.host;
  }
}
