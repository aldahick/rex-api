import { guard, HttpError, mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";
import { IMutation, IMutationAddCalendarArgs, IMutationRemoveCalendarArgs, IQuery } from "../graphql/types";
import { AuthContext } from "../manager/auth";
import { UserManager } from "../manager/user";

@singleton()
export class CalendarResolver {
  constructor(
    private readonly userManager: UserManager
  ) { }

  @guard({
    resource: "user",
    action: "readOwn",
    attributes: "calendars"
  })
  @query()
  async calendars(root: unknown, args: unknown, context: AuthContext): Promise<IQuery["calendars"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Query.calendars requires a user token");
    }
    return user.calendars;
  }

  @guard({
    resource: "user",
    action: "createOwn",
    attributes: "calendars"
  })
  @mutation()
  async addCalendar(root: unknown, { name, url }: IMutationAddCalendarArgs, context: AuthContext): Promise<IMutation["addCalendar"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.addCalendar requires a user token");
    }
    await this.userManager.calendar.add(user, { name, url });
    return true;
  }

  @guard({
    resource: "user",
    action: "deleteOwn",
    attributes: "calendars"
  })
  @mutation()
  async removeCalendar(root: unknown, { id }: IMutationRemoveCalendarArgs, context: AuthContext): Promise<IMutation["removeCalendar"]> {
    const user = await context.user();
    if (!user) {
      throw HttpError.badRequest("Mutation.addCalendar requires a user token");
    }
    await this.userManager.calendar.remove(user, id);
    return true;
  }
}
