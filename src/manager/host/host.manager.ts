import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";
import { Host } from "../../model/Host";
import { DatabaseService } from "../../service/database";

@singleton()
export class HostManager {
  constructor(
    private readonly db: DatabaseService
  ) { }

  async get(id: string): Promise<Host> {
    const host = await this.db.hosts.findById(id);
    if (!host) {
      throw HttpError.notFound(`host id=${id}`);
    }
    return host;
  }
}
