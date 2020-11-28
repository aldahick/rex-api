import { prop } from "@typegoose/typegoose";

import { INotificationPlatform } from "../../graphql/types";

export class UserNotificationDevice {
  @prop({ required: true, enum: INotificationPlatform })
  platform!: INotificationPlatform;

  @prop({ required: true })
  arn!: string;

  constructor(init?: UserNotificationDevice) {
    Object.assign(this, init);
  }
}
