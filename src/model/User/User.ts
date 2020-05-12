import { prop, arrayProp } from "@typegoose/typegoose";
import { MongoService } from "@athenajs/core";
import { UserAuth } from "./UserAuth";

export class User {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true, _id: false })
  auth!: UserAuth;

  @prop({ required: true })
  email!: string;

  @prop()
  username?: string;

  @arrayProp({ required: true, items: String })
  roleIds!: string[];

  constructor(init?: Omit<User, "_id">) {
    Object.assign(this, init);
  }
}
