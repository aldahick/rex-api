import { prop } from "@typegoose/typegoose";

import { INotificationPlatform } from "../../graphql";

export class UserNotificationDevice {
  @prop({ required: true, enum: INotificationPlatform })
  platform!: INotificationPlatform;

  @prop()
  arn?: string;

  @prop({ required: true })
  token!: string;

  constructor(init?: UserNotificationDevice) {
    Object.assign(this, init);
  }
}
