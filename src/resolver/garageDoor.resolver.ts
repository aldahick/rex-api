import { guard, mutation } from "@athenajs/core";
import { singleton } from "tsyringe";

import {
  IMutation,
  IMutationCreateGarageDoorArgs,
  IMutationDeleteGarageDoorArgs,
  IMutationToggleGarageDoorArgs
} from "../graphql";
import { GarageDoorManager } from "../manager/garageDoor";

@singleton()
export class GarageDoorResolver {
  constructor(
    private readonly garageDoorManager: GarageDoorManager
  ) { }

  @guard({
    resource: "garageDoor",
    action: "createAny"
  })
  @mutation("createGarageDoor")
  async createGarageDoor(root: unknown, { name }: IMutationCreateGarageDoorArgs): Promise<IMutation["createGarageDoor"]> {
    return this.garageDoorManager.create(name);
  }

  @guard({
    resource: "garageDoor",
    action: "deleteAny"
  })
  @mutation("deleteGarageDoor")
  async deleteGarageDoor(root: unknown, { id }: IMutationDeleteGarageDoorArgs): Promise<IMutation["deleteGarageDoor"]> {
    const garageDoor = await this.garageDoorManager.get(id);
    await this.garageDoorManager.delete(garageDoor);
    return true;
  }

  @guard({
    resource: "garageDoor",
    action: "updateAny"
  })
  @mutation("toggleGarageDoor")
  async toggleGarageDoor(root: unknown, { id }: IMutationToggleGarageDoorArgs): Promise<IMutation["toggleGarageDoor"]> {
    const garageDoor = await this.garageDoorManager.get(id);
    await this.garageDoorManager.toggle(garageDoor);
    return true;
  }
}
