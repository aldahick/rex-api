import { guard, HttpError, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationDeregisterNotificationDeviceArgs, IMutationRegisterNotificationDeviceArgs, IQuery } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { UserManager } from "../manager/user";

@singleton()
export class NotificationDeviceResolver {
  constructor(
    private readonly userManager: UserManager
  ) { }

  @guard({
    resource: "notificationDevice",
    action: "createOwn"
  })
  @mutation()
  async registerNotificationDevice(root: unknown, { platform, token }: IMutationRegisterNotificationDeviceArgs, context: AuthContext): Promise<IMutation["registerNotificationDevice"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.registerNotificationDevice requires a user token");
    }
    await this.userManager.notificationDevice.register(user, platform, token);
    return true;
  }

  @guard({
    resource: "notificationDevice",
    action: "deleteOwn"
  })
  @mutation()
  async deregisterNotificationDevice(root: unknown, { platform }: IMutationDeregisterNotificationDeviceArgs, context: AuthContext): Promise<IMutation["deregisterNotificationDevice"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.deregisterNotificationDevice requires a user token");
    }
    await this.userManager.notificationDevice.deregister(user, platform);
    return true;
  }

  @guard({
    resource: "notificationDevice",
    action: "readOwn"
  })
  @query()
  async notificationDevices(root: unknown, args: unknown, context: AuthContext): Promise<IQuery["notificationDevices"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Query.notificationDevices requires a user token");
    }
    return user.notificationDevices;
  }
}
