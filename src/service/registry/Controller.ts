import { HttpMethod } from "../../util/HttpMethod";
import { HttpError } from "../../util/HttpError";
import { Request, Response } from "express";

export interface ControllerPayload {
  req: Request;
  res: Response;
}

export class Controller {
  method!: HttpMethod;
  route!: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(payload: ControllerPayload): Promise<any> {
    throw HttpError.notImplemented();
  }
}
