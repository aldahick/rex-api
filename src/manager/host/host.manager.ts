import { singleton } from "tsyringe";
import { DatabaseService } from "../../service/database";
import { Host } from "../../model/Host";
import { HttpError } from "../../util/HttpError";

@singleton()
export class HostManager {
  constructor(
    private db: DatabaseService
  ) { }

  async get(id: string): Promise<Host> {
    const host = await this.db.hosts.findById(id);
    if (!host) {
      throw HttpError.notFound(`host id=${id}`);
    }
    return host;
  }
}
