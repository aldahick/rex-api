import { queueEvent, QueuePayload } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IGarageDoorsPayload, IGarageDoorStatusPayload, IQueueEventType } from "../graphql/types";
import { GarageDoorManager } from "../manager/garageDoor";

@singleton()
export class GarageDoorQueueHandler {
  constructor(
    private readonly garageDoorManager: GarageDoorManager
  ) { }

  @queueEvent(IQueueEventType.GarageDoorStatus)
  async onGarageDoorStatus({ data: { id, isOpen } }: QueuePayload<IGarageDoorStatusPayload>): Promise<void> {
    const garageDoor = await this.garageDoorManager.get(id);
    await this.garageDoorManager.setIsOpen(garageDoor, isOpen);
    const garageDoors = await this.garageDoorManager.getAll();
    this.garageDoorManager.broadcastSockets<IGarageDoorsPayload>("garageDoors", {
      garageDoors
    });
  }
}
