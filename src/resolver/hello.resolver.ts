import { mutation, query } from "@athenajs/core";
import { singleton } from "tsyringe";

import { IMutation, IQuery } from "../graphql/types";

@singleton()
export class HelloResolver {
  @mutation()
  @query()
  hello(): IQuery["hello"] & IMutation["hello"] {
    return "Hello, world!";
  }
}
