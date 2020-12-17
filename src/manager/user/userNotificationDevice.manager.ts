/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { HttpError } from "@athenajs/core";
import { singleton } from "tsyringe";

import { INotificationPlatform } from "../../graphql";
import { User, UserNotificationDevice } from "../../model/User";
import { AwsService } from "../../service/aws";
import { DatabaseService } from "../../service/database";

@singleton()
export class UserNotificationDeviceManager {
  constructor(
    private readonly aws: AwsService,
    private readonly db: DatabaseService
  ) { }

  async register(user: User, platform: INotificationPlatform, token: string): Promise<void> {
    const arn = await this.aws.createSnsEndpointArn(platform, token);
    if (arn === undefined) {
      throw HttpError.internalError("Couldn't create SNS endpoint");
    }
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $set: {
        notificationDevices: user.notificationDevices
          .filter(d => d.platform !== platform)
          .concat([
            new UserNotificationDevice({
              platform,
              arn
            })
          ])
      }
    });
    await this.deleteAllArns(user, platform);
  }

  async deregister(user: User, platform: INotificationPlatform): Promise<void> {
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $pull: {
        notificationDevices: {
          platform
        }
      }
    });
    await this.deleteAllArns(user, platform);
  }

  private async deleteAllArns(user: User, platform: INotificationPlatform): Promise<void> {
    const devicesToRemove = user.notificationDevices.filter(d => d.platform === platform);
    for (const device of devicesToRemove) {
      await this.aws.deleteSnsEndpointArn(platform, device.arn);
    }
  }
}
