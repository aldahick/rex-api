import { singleton } from "tsyringe";
import { User, UserCalendar } from "../../model/User";
import { DatabaseService } from "../../service/database";

@singleton()
export class UserCalendarManager {
  constructor(
    private db: DatabaseService
  ) { }

  async add(user: User, { name, url }: Omit<UserCalendar, "_id">): Promise<void> {
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $push: {
        calendars: new UserCalendar({ name, url })
      }
    });
  }

  async remove(user: User, calendarId: string): Promise<void> {
    await this.db.users.updateOne({
      _id: user._id
    }, {
      $pull: {
        calendars: { _id: calendarId }
      }
    });
  }
}
