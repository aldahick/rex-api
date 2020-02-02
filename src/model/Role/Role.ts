import { idProp } from "../../util/mongo";
import { RolePermission } from "./RolePermission";
import { prop, arrayProp } from "@typegoose/typegoose";

export class Role {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @arrayProp({ required: true, items: RolePermission, _id: false })
  permissions!: RolePermission[];

  constructor(init?: Omit<Role, "_id">) {
    Object.assign(this, init);
  }
}
