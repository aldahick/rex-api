import { HttpError, RedisService, WebsocketRegistry } from "@athenajs/core";
import { Server } from "socket.io";
import { singleton } from "tsyringe";

import { IGarageDoorTogglePayload, IQueueEventType } from "../../graphql";
import { GarageDoor } from "../../model/GarageDoor";
import { DatabaseService } from "../../service/database";

@singleton()
export class GarageDoorManager {
  private get io(): Server {
    return this.websocketRegistry.io;
  }

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly websocketRegistry: WebsocketRegistry
  ) { }

  async get(id: string): Promise<GarageDoor> {
    const garageDoor = await this.db.garageDoors.findById(id);
    if (!garageDoor) {
      throw HttpError.notFound(`garage door id=${id}`);
    }
    return garageDoor;
  }

  async getAll(): Promise<GarageDoor[]> {
    return this.db.garageDoors.find();
  }

  async create(name: string): Promise<GarageDoor> {
    return this.db.garageDoors.create(new GarageDoor({
      name,
      isOpen: false
    }));
  }

  async delete(garageDoor: GarageDoor): Promise<void> {
    await this.db.garageDoors.deleteOne({ _id: garageDoor._id });
  }

  async toggle(garageDoor: GarageDoor): Promise<void> {
    await this.redis.emit<IGarageDoorTogglePayload>(IQueueEventType.ToggleGarageDoor, {
      id: garageDoor._id
    });
  }

  async setIsOpen(garageDoor: GarageDoor, isOpen: boolean): Promise<void> {
    await this.db.garageDoors.updateOne({
      _id: garageDoor._id
    }, {
      $set: {
        isOpen
      }
    });
  }

  broadcastSockets<Payload>(eventName: string, payload: Payload): void {
    this.io.to("garageDoors").emit(eventName, payload);
  }
}
