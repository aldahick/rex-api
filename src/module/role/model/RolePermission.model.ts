import { prop } from "@typegoose/typegoose";

export class RolePermission {
  @prop({ required: true })
  resource!: string;

  @prop({ required: true })
  action!: string;
}
