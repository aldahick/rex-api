import { guard, mutation } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationCreateGarageDoorArgs, IMutationDeleteGarageDoorArgs, IMutationToggleGarageDoorArgs, IMutationUpdateGarageDoorArgs } from "../graphql/types";
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
    const garageDoor = await this.garageDoorManager.create(name);
    return garageDoor.toGqlObject();
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
