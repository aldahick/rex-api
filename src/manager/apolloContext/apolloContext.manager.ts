import * as express from "express";
import { singleton } from "tsyringe";
import { ApolloContext } from "./ApolloContext";

@singleton()
export class ApolloContextManager {
  build(req: express.Request) {
    return new ApolloContext(req);
  }
}
