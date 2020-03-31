import { Request, Response } from "express";
import { HttpMethod } from "../../util/HttpMethod";
import { AuthContext } from "../../manager/auth";

export interface ControllerPayload {
  context: AuthContext;
  req: Request;
  res: Response;
}

export interface Controller {
  method: HttpMethod;
  route: string;
  handle(payload: ControllerPayload): Promise<any>;
}
