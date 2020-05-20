import { MongoService } from "@athenajs/core";
import { arrayProp,prop } from "@typegoose/typegoose";
import { UserAuth } from "./UserAuth";
import { UserCalendar } from "./UserCalendar";

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

  @arrayProp({ required: true, items: UserCalendar })
  calendars!: UserCalendar[];

  constructor(init?: Omit<User, "_id">) {
    Object.assign(this, init);
  }
}
