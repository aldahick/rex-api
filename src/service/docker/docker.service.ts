import { HttpError } from "@athenajs/core";
import * as Dockerode from "dockerode";
import * as _ from "lodash";
import * as url from "url";

export type DockerContainerState = "created" | "running" | "exited";

export class DockerService {
  private readonly docker: Dockerode;

  constructor(
    private readonly endpoint: string
  ) {
    const { hostname, protocol, port, path, auth } = url.parse(endpoint);
    if (hostname === null || protocol === null || path === null || auth === null) {
      throw HttpError.internalError(`Bad Docker endpoint ${endpoint}`);
    }
    this.docker = new Dockerode({
      host: hostname,
      protocol: protocol === "https:" ? "https" : "http",
      port: port ?? (protocol === "https:" ? 443 : 80),
      version: "v1.40",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: `Basic ${Buffer.from(auth).toString("base64")}`
      },
      socketPath: undefined
    } as Dockerode.DockerOptions & {
      headers: Record<string, string>;
    });
    (this.docker.modem as Record<string, unknown>).path = path;
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
    /* eslint-disable @typescript-eslint/naming-convention */
    const portBindings = _.mapValues(
      _.mapKeys(ports.filter(p => p.hostPort !== undefined), p => `${p.containerPort}/tcp`),
      p => [{
        HostPort: p.hostPort?.toString(),
        HostIp: p.hostBindIp?.toString() ?? ""
      }]
    );
    const container = await this.docker.createContainer({
      Image: fullImage,
      name,
      Env: variables.map(v => `${v.name}=${v.value}`),
      HostConfig: {
        Binds: volumes.map(v => `${v.hostPath}:${v.containerPath}`),
        PortBindings: portBindings,
        NetworkMode: networkName,
        RestartPolicy: {
          Name: "always"
        }
      }
    });
    /* eslint-enable @typescript-eslint/naming-convention */
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
      if ("statusCode" in err && (err as { statusCode: unknown }).statusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  async startContainer({ id }: {
    id: string;
  }): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.start();
  }

  async stopContainer({ id }: {
    id: string;
  }): Promise<void> {
    const container = this.docker.getContainer(id);
    await container.stop();
  }

  async listContainers(): Promise<Dockerode.ContainerInfo[]> {
    return this.docker.listContainers({
      all: true
    });
  }
}
