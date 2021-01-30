import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

import { UserAuth } from "./UserAuth.model";
import { UserNote } from "./UserNote.model";

export class User {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true, _id: false })
  auth!: UserAuth;

  @prop({ required: true })
  email!: string;

  @prop()
  username?: string;

  @prop({ required: true, type: String })
  roleIds!: string[];

  @prop({ required: true, type: UserNote })
  notes!: UserNote[];

  constructor(init?: Omit<User, "_id">) {
    Object.assign(this, init);
  }
}
