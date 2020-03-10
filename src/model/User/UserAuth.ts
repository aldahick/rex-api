import { prop } from "@typegoose/typegoose";

export class UserAuth {
  @prop()
  googleUserId?: string;

  @prop()
  passwordHash?: string;
}
