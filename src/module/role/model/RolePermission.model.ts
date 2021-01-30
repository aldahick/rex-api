import { prop } from "@typegoose/typegoose";

import { IAuthAction } from "../../../graphql";

export class RolePermission {
  @prop({ required: true })
  resource!: string;

  @prop({ required: true })
  action!: IAuthAction;
}
