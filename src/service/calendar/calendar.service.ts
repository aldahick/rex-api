import * as ical from "ical";
import * as _ from "lodash";
import { singleton } from "tsyringe";

@singleton()
export class CalendarService {
  async getEvents(data: string) {
    const calendar = ical.parseICS(data);
    console.log(_.uniq(_.flatten(Object.values(calendar).map(Object.keys))));
    return _.compact(Object.values(calendar)
      .filter(e => e.type === "VEVENT")
      .map(({ summary, start, end }) => {
        if (!summary || !start || !end) {
          return;
        }
        return { summary, start, end };
      })
    );
  }
}
