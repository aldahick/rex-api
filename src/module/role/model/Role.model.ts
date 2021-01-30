import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

import { RolePermission } from "./RolePermission.model";

export class Role {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true, type: RolePermission, _id: false })
  permissions!: RolePermission[];

  constructor(init?: Omit<Role, "_id">) {
    Object.assign(this, init);
  }
}
