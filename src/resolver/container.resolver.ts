import { guard, mutation, query, resolver } from "@athenajs/core";
import { singleton } from "tsyringe";

import {
  IContainer,
  IContainerStatus,
  IMutation,
  IMutationCreateContainerArgs,
  IMutationDeleteContainersArgs,
  IMutationRedeployContainerArgs,
  IMutationStartContainerArgs,
  IMutationStopContainerArgs,
  IMutationUpdateContainerPortsArgs,
  IMutationUpdateContainerVariablesArgs,
  IMutationUpdateContainerVolumesArgs,
  IQuery,
  IQueryContainerArgs} from "../graphql";
import { ContainerManager } from "../manager/container";
import { HostManager } from "../manager/host";
import { Container } from "../model/Container";
import { Host } from "../model/Host";
import { DatabaseService } from "../service/database";

@singleton()
export class ContainerResolver {
  constructor(
    private readonly containerManager: ContainerManager,
    private readonly db: DatabaseService,
    private readonly hostManager: HostManager
  ) { }

  @guard({
    resource: "container",
    action: "readAny"
  })
  @query()
  async container(root: unknown, { id }: IQueryContainerArgs): Promise<IQuery["container"]> {
    const { container, host } = await this.getContainerAndHost(id);
    return {
      ...container,
      host,
      status: IContainerStatus.Running
    };
  }

  @guard({
    resource: "container",
    action: "readAny"
  })
  @query()
  async containers(): Promise<IQuery["containers"]> {
    return this.containerManager.getAll();
  }

  @guard({
    resource: "container",
    action: "createAny"
  })
  @mutation()
  async createContainer(root: unknown, { container }: IMutationCreateContainerArgs): Promise<IMutation["createContainer"]> {
    const host = await this.hostManager.get(container.hostId);
    const newContainer = new Container({
      ...container,
      dockerId: "",
      ports: [],
      variables: [],
      volumes: []
    });
    newContainer.dockerId = await this.containerManager.deploy(newContainer, host);
    const created = await this.db.containers.create(newContainer);
    return {
      ...this.containerManager.toGqlObjects([created], [host])[0],
      status: IContainerStatus.Stopped
    };
  }

  @guard({
    resource: "container",
    action: "deleteAny"
  })
  @mutation()
  async deleteContainers(root: unknown, { ids }: IMutationDeleteContainersArgs): Promise<IMutation["deleteContainers"]> {
    await this.containerManager.delete(ids);
    return true;
  }

  @guard({
    resource: "container",
    action: "updateAny",
    attributes: "ports"
  })
  @mutation()
  async updateContainerPorts(root: unknown, { containerId, ports }: IMutationUpdateContainerPortsArgs): Promise<IMutation["updateContainerPorts"]> {
    await this.containerManager.updateField(containerId, "ports", ports);
    return true;
  }

  @guard({
    resource: "container",
    action: "updateAny",
    attributes: "variables"
  })
  @mutation()
  async updateContainerVariables(root: unknown, { containerId, variables }: IMutationUpdateContainerVariablesArgs): Promise<IMutation["updateContainerVariables"]> {
    await this.containerManager.updateField(containerId, "variables", variables);
    return true;
  }

  @guard({
    resource: "container",
    action: "updateAny",
    attributes: "volumes"
  })
  @mutation()
  async updateContainerVolumes(root: unknown, { containerId, volumes }: IMutationUpdateContainerVolumesArgs): Promise<IMutation["updateContainerVolumes"]> {
    await this.containerManager.updateField(containerId, "volumes", volumes);
    return true;
  }

  @guard({
    resource: "container",
    action: "updateAny",
    attributes: "deploy"
  })
  @mutation()
  async redeployContainer(root: unknown, { containerId }: IMutationRedeployContainerArgs): Promise<IMutation["redeployContainer"]> {
    const { container, host } = await this.getContainerAndHost(containerId);
    const dockerId = await this.containerManager.deploy(container, host);
    await this.db.containers.updateOne({
      _id: container._id
    }, {
      $set: { dockerId }
    });
    return true;
  }

  @guard({
    resource: "container",
    action: "updateAny",
    attributes: "start"
  })
  @mutation()
  async startContainer(root: unknown, { containerId }: IMutationStartContainerArgs): Promise<IMutation["startContainer"]> {
    const { container, host } = await this.getContainerAndHost(containerId);
    await this.containerManager.start(container, host);
    return true;
  }

  @guard({
    resource: "container",
    action: "updateAny",
    attributes: "stop"
  })
  @mutation()
  async stopContainer(root: unknown, { containerId }: IMutationStopContainerArgs): Promise<IMutation["stopContainer"]> {
    const { container, host } = await this.getContainerAndHost(containerId);
    await this.containerManager.stop(container, host);
    return true;
  }

  @guard({
    resource: "host",
    action: "readAny"
  })
  @resolver("Container.host")
  host(root: IContainer): IContainer["host"] {
    return root.host;
  }

  private async getContainerAndHost(containerId: string): Promise<{
    container: Container;
    host: Host;
  }> {
    const container = await this.containerManager.get(containerId);
    const host = await this.hostManager.get(container.hostId);
    return { container, host };
  }
}
