import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

export class UserNote {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  body!: string;

  @prop({ required: true })
  createdAt!: Date;

  constructor(init?: Omit<UserNote, "_id">) {
    Object.assign(this, init);
  }
}
