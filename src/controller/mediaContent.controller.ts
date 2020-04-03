import * as mime from "mime";
import { singleton } from "tsyringe";
import { Controller, ControllerPayload } from "../service/registry";
import { HttpMethod } from "../util/HttpMethod";
import { guard } from "../manager/auth";
import { HttpError } from "../util/HttpError";
import { User } from "../model/User";
import { MediaManager } from "../manager/media";

@singleton()
export class MediaContentController implements Controller {
  method = HttpMethod.Get;
  route = "/v1/media/content";

  constructor(
    private mediaManager: MediaManager
  ) { }

  @guard(can => can.read("mediaItem"))
  async handle(payload: ControllerPayload) {
    const { req, res, context } = payload;
    const { key } = req.query;
    if (!key) {
      throw HttpError.badRequest("Missing required query parameter `key`");
    }

    const user = await context.user();
    if (!user) {
      throw HttpError.forbidden("Requires user token");
    }

    const { isFile } = await this.mediaManager.exists(user, key);

    if (!isFile) {
      throw HttpError.notFound();
    }

    const { start, end } = await this.sendHeaders(payload, user, key);
    const stream = this.mediaManager.createReadStream(user, key, { start, end });
    stream.pipe(res);
  }

  private async sendHeaders({ req, res }: ControllerPayload, user: User, key: string): Promise<{ start: number; end?: number }> {
    const mimeType = mime.getType(key) || "text/plain";
    let start = 0;
    let end: number | undefined;
    if (!mimeType.startsWith("video/") && !mimeType.startsWith("audio/")) {
      return { start, end };
    }

    const size = await this.mediaManager.getSize(user, key);
    if (req.headers.range) {
      [start, end] = req.headers.range.replace("bytes=", "").split("-").map(Number);
    }
    if (!end) {
      end = size - 1;
    }
    res.writeHead(206, {
      "Accept-Range": "bytes",
      "Content-Length": (end - start) + 1,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Type": mimeType
    });
    return { start, end };
  }
}