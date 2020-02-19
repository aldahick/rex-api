import * as url from "url";
import * as Dockerode from "dockerode";
import * as _ from "lodash";
import { HttpError } from "../../util/HttpError";

export type DockerContainerState = "created" | "running" | "exited";

export class DockerService {
  private docker: Dockerode;

  constructor(
    private endpoint: string
  ) {
    const { hostname, protocol, port, path, auth } = url.parse(this.endpoint);
    if (!hostname || !protocol || !path || !auth) {
      throw HttpError.internalError(`Bad Docker endpoint ${this.endpoint}`);
    }
    this.docker = new Dockerode({
      host: hostname,
      protocol: protocol === "https:" ? "https" : "http",
      port: port || (protocol === "https:" ? 443 : 80),
      version: "v1.40",
      headers: {
        Authorization: `Basic ${Buffer.from(auth).toString("base64")}`
      },
      socketPath: undefined
    } as Dockerode.DockerOptions & {
      headers: { [key: string]: any };
    });
    this.docker.modem.path = path;
  }

  async createContainer({ image, tag, name, networkName, ports, variables, volumes }: {
    image: string;
    tag: string;
    name: string;
    networkName: string;
    ports: { containerPort: number; hostPort?: number; hostBindIp?: string }[];
    variables: { name: string; value: string }[];
    volumes: { hostPath: string; containerPath: string }[];
  }): Promise<string> {
    let fullImage = `${image}:${tag}`;
    const slashCount = fullImage.split("/").length;
    if (slashCount === 0) {
      fullImage = `docker.io/_/${fullImage}`;
    } else if (slashCount === 1) {
      fullImage = `docker.io/${fullImage}`;
    }
    await this.docker.pull(fullImage, {});
    const portBindings = _.mapValues(
      _.mapKeys(ports.filter(p => !!p.hostPort), p => `${p.containerPort}/tcp`),
      p => [{
        HostPort: p.hostPort?.toString(),
        HostIp: p.hostBindIp?.toString() || ""
      }]
    );
    const container = await this.docker.createContainer({
      Image: fullImage,
      name,
      Env: variables.map(v => `${v.name}=${v.value}`),
      HostConfig: {
        Binds: volumes.map(v => `${v.hostPath}:${v.containerPath}`),
        PortBindings: portBindings,
        NetworkMode: networkName
      }
    });
    return container.id;
  }

  async removeContainer({ id }: {
    id: string;
  }): Promise<boolean> {
    if (!id) {
      return false;
    }
    const container = this.docker.getContainer(id);
    try {
      await container.remove({});
      return true;
    } catch (err) {
      if (err.statusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async startContainer({ id }: {
    id: string;
  }) {
    const container = this.docker.getContainer(id);
    await container.start();
  }

  async stopContainer({ id }: {
    id: string;
  }) {
    const container = this.docker.getContainer(id);
    await container.stop();
  }

  async listContainers() {
    return this.docker.listContainers({
      all: true
    });
  }
}
