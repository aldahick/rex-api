import { Request, Response } from "express";
import { HttpMethod } from "../../util/HttpMethod";
import { ApolloContext } from "../../manager/apolloContext";

export interface ControllerPayload {
  context: ApolloContext;
  req: Request;
  res: Response;
}

export interface Controller {
  method: HttpMethod;
  route: string;
  handle(payload: ControllerPayload): Promise<any>;
}
