import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

export class UserCalendar {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  url!: string;

  constructor(init?: Omit<UserCalendar, "_id">) {
    Object.assign(this, init);
  }
}
