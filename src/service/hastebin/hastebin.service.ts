import axios from "axios";
import { singleton } from "tsyringe";

@singleton()
export class HastebinService {
  /** returns url */
  async create(body: string): Promise<string> {
    const { data: { key } } = await axios.post<{
      key: string;
    }>("https://hastebin.com/documents", body);
    return `https://hastebin.com/${key}`;
  }
}
