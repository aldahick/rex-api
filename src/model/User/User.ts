import { prop, arrayProp } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";
import { UserAuth } from "./UserAuth";

export class User {
  @idProp()
  _id!: string;

  @prop({ required: true, _id: false })
  auth!: UserAuth;

  @prop({ required: true })
  email!: string;

  @arrayProp({ required: true, items: String })
  roleIds!: string[];

  constructor(init?: Omit<User, "_id">) {
    Object.assign(this, init);
  }
}
