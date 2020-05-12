import { singleton } from "tsyringe";
import { mutation, query } from "@athenajs/core";
import { IQuery, IMutation } from "../graphql/types";

@singleton()
export class HelloResolver {
  @mutation()
  @query()
  hello(): IQuery["hello"] & IMutation["hello"] {
    return "Hello, world!";
  }
}
