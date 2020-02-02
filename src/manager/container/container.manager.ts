import { DatabaseService } from "../../service/database";
import { Container } from "../../model/Container";
import { HttpError } from "../../util/HttpError";
import { Host } from "../../model/Host";
import { IContainer, IContainerStatus } from "../../graphql/types";
import { DockerService, DockerContainerState } from "../../service/docker";
import { singleton } from "tsyringe";
import * as _ from "lodash";
import { DocumentType } from "@typegoose/typegoose";

@singleton()
export class ContainerManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<Container> {
    const container = await this.db.containers.findById(id);
    if (!container) {
      throw HttpError.notFound(`container id=${id}`);
    }
    return container.toObject();
  }

  async getAll() {
    const containers = await this.db.containers.find();
    const hosts = await this.db.hosts.find({
      _id: { $in: containers.map(c => c.hostId) }
    });
    const dockerContainers = _.flatten(await Promise.all(hosts.map(host =>
      new DockerService(host.dockerEndpoint).listContainers()
    )));
    return this.toGqlObjects(containers, hosts).map(container => {
      const dockerContainer = dockerContainers.find(c => c.Id === container.dockerId);
      return {
        ...container,
        status: this.convertStatus(dockerContainer?.State as DockerContainerState)
      };
    });
  }

  async delete(ids: string[]): Promise<void> {
    const containers = (await this.getAll()).filter(c => ids.includes(c._id));
    await Promise.all(containers.map(async container => {
      const docker = new DockerService(container.host.dockerEndpoint);
      if (container.status === IContainerStatus.Running || container.status === IContainerStatus.Starting) {
        await docker.stopContainer({ id: container.dockerId });
      }
      await docker.removeContainer({ id: container.dockerId });
    }));
    await this.db.containers.deleteMany({
      _id: { $in: ids }
    });
  }

  async deploy(container: Container, host: Host): Promise<string> {
    const docker = new DockerService(host.dockerEndpoint);
    await docker.removeContainer({
      id: container.dockerId
    });
    console.log("create");
    const dockerId = await docker.createContainer({
      image: container.image,
      tag: container.tag,
      name: container.name
    });
    await this.db.containers.updateOne({ _id: container._id }, {
      $set: {
        dockerId
      }
    });
    return dockerId;
  }

  async start(container: Container, host: Host): Promise<void> {
    const docker = new DockerService(host.dockerEndpoint);
    await docker.startContainer({ id: container.dockerId });
  }

  async stop(container: Container, host: Host): Promise<void> {
    const docker = new DockerService(host.dockerEndpoint);
    await docker.stopContainer({ id: container.dockerId });
  }

  toGqlObjects(containers: DocumentType<Container>[], hosts: Host[]): (Container & Omit<IContainer, "status"> & { host: Host })[] {
    return containers.map(container => {
      const host = hosts.find(h => h._id === container.hostId);
      if (!host) {
        throw HttpError.notFound(`host id=${container.hostId}`);
      }
      return {
        ...container.toObject() as Container,
        host
      };
    });
  }

  convertStatus(status: DockerContainerState | undefined): IContainerStatus {
    switch (status) {
      case "created":
      case "exited":
        return IContainerStatus.Stopped;
      case "running":
        return IContainerStatus.Running;
      case undefined:
      default:
        return IContainerStatus.Unknown;
    }
  }
}
