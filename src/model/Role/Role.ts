import { MongoService } from "@athenajs/core";
import { arrayProp,prop } from "@typegoose/typegoose";
import { RolePermission } from "./RolePermission";

export class Role {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @arrayProp({ required: true, items: RolePermission, _id: false })
  permissions!: RolePermission[];

  constructor(init?: Omit<Role, "_id">) {
    Object.assign(this, init);
  }
}
