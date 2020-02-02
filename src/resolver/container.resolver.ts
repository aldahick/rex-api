import {
  IContainer,
  IContainerStatus,
  IMutation,
  IMutationCreateContainerArgs,
  IMutationDeleteContainersArgs,
  IMutationRedeployContainerArgs,
  IMutationRemoveContainerVariableArgs,
  IMutationSetContainerVariableArgs,
  IMutationUpdateContainerPortsArgs,
  IQuery,
  IQueryContainerArgs,
  IMutationStartContainerArgs,
  IMutationStopContainerArgs
} from "../graphql/types";
import { guard } from "../manager/auth/guard";
import { ContainerManager } from "../manager/container";
import { HostManager } from "../manager/host";
import { Container } from "../model/Container";
import { DatabaseService } from "../service/database";
import { mutation, query, resolver } from "../service/registry";
import { singleton } from "tsyringe";

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
    const { container, host } = await this.getContainerAndHost(id);
    return {
      ...container,
      host,
      status: IContainerStatus.Running
    };
  }

  @guard(can => can.read("container"))
  @query()
  async containers(): Promise<IQuery["containers"]> {
    return this.containerManager.getAll();
  }

  @guard(can => can.create("container"))
  @mutation()
  async createContainer(root: void, { container }: IMutationCreateContainerArgs): Promise<IMutation["createContainer"]> {
    const host = await this.hostManager.get(container.hostId);
    const newContainer = new Container({
      ...container,
      dockerId: "",
      ports: [],
      variables: []
    });
    console.log(newContainer);
    newContainer.dockerId = await this.containerManager.deploy(newContainer, host);
    const created = await this.db.containers.create(newContainer);
    return {
      ...this.containerManager.toGqlObjects([created], [host])[0],
      status: IContainerStatus.Stopped
    };
  }

  @guard(can => can.delete("container"))
  @mutation()
  async deleteContainers(root: void, { ids }: IMutationDeleteContainersArgs): Promise<IMutation["deleteContainers"]> {
    await this.containerManager.delete(ids);
    return true;
  }

  @guard(can => can.update("container"))
  @mutation()
  async updateContainerPorts(root: void, { containerId, ports }: IMutationUpdateContainerPortsArgs): Promise<IMutation["updateContainerPorts"]> {
    await this.db.containers.updateOne({
      _id: containerId,
    }, {
      $set: {
        ports
      } as Partial<Container>
    });
    return true;
  }

  @guard(can => can.update("container"))
  @mutation()
  async setContainerVariable(root: void, { containerId, name, value }: IMutationSetContainerVariableArgs): Promise<IMutation["setContainerVariable"]> {
    const container = await this.containerManager.get(containerId);

    await this.db.containers.updateOne({
      _id: container._id
    }, {
      $set: {
        variables: container.variables
          .filter(v => v.name !== name)
          .concat([{ name, value }])
      }
    });

    return true;
  }

  @guard(can => can.update("container"))
  @mutation()
  async removeContainerVariable(root: void, { containerId, name }: IMutationRemoveContainerVariableArgs): Promise<IMutation["removeContainerVariable"]> {
    const container = await this.containerManager.get(containerId);

    await this.db.containers.updateOne({
      _id: container._id
    }, {
      $set: {
        variables: container.variables.filter(v => v.name !== name)
      }
    });

    return true;
  }

  @guard(can => can.update("container"))
  @mutation()
  async redeployContainer(root: void, { containerId }: IMutationRedeployContainerArgs): Promise<IMutation["redeployContainer"]> {
    const { container, host } = await this.getContainerAndHost(containerId);
    const dockerId = await this.containerManager.deploy(container, host);
    await this.db.containers.updateOne({
      _id: container._id
    }, {
      $set: { dockerId }
    });
    return true;
  }

  @guard(can => can.update("container"))
  @mutation()
  async startContainer(root: void, { containerId }: IMutationStartContainerArgs): Promise<IMutation["startContainer"]> {
    const { container, host } = await this.getContainerAndHost(containerId);
    await this.containerManager.start(container, host);
    return true;
  }

  @guard(can => can.update("container"))
  @mutation()
  async stopContainer(root: void, { containerId }: IMutationStopContainerArgs): Promise<IMutation["stopContainer"]> {
    const { container, host } = await this.getContainerAndHost(containerId);
    await this.containerManager.stop(container, host);
    return true;
  }

  @guard(can => can.read("host"))
  @resolver("Container.host")
  host(root: IContainer) {
    return root.host;
  }

  private async getContainerAndHost(containerId: string) {
    const container = await this.containerManager.get(containerId);
    const host = await this.hostManager.get(container.hostId);
    return { container, host };
  }
}
