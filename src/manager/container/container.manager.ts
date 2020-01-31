import { singleton } from "tsyringe";
import { DocumentType } from "@typegoose/typegoose";
import { DatabaseService } from "../../service/database";
import { Container } from "../../model/Container";
import { HttpError } from "../../util/HttpError";
import { Host } from "../../model/Host";
import { IContainer, IContainerStatus } from "../../graphql/types";

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

  toGqlObjects(containers: DocumentType<Container>[], hosts: Host[]): IContainer[] {
    return containers.map(container => ({
      ...container.toObject(),
      host: hosts.find(h => h._id === container.hostId),
      status: IContainerStatus.Running
    }));
  }
}
