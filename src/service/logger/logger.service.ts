import * as util from "util";
import * as moment from "moment";
import { singleton } from "tsyringe";
import { LogLevel } from "./LogLevel";

@singleton()
export class LoggerService {
  lastLogTime = moment(0);

  debug(name: string, data?: any) { return this.log(LogLevel.Debug, name, data); }
  info(name: string, data?: any) { return this.log(LogLevel.Info, name, data); }
  warn(name: string, data?: any) { return this.log(LogLevel.Warn, name, data); }
  error(name: string, err: Error, data?: any) { return this.log(LogLevel.Error, name, { err, ...data }); }

  protected log(level: LogLevel, name: string, data?: any) {
    const now = moment();
    let dateFormat = "HH:mm:ss";
    if (now.toDate().toLocaleDateString() !== this.lastLogTime.toDate().toLocaleDateString()) {
      dateFormat = `YYYY-MM-DD ${dateFormat}`;
      this.lastLogTime = now;
    }
    let extra = data;
    if (typeof(extra) === "object") {
      extra = Object.entries(extra).map(([k, v]) =>
        v instanceof Error ? `${k}="${v.stack}"` : `${k}=${util.inspect(v)}`
      ).join(" ");
    }
    // eslint-disable-next-line no-console
    console.log(`${now.format(dateFormat)} [${level}] [${name}]${extra === undefined ? "" : (` ${extra}`)}`);
  }
}
