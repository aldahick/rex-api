import { singleton } from "tsyringe";
import { query, mutation } from "../service/registry";
import { IQuery, IMutation } from "../graphql/types";

@singleton()
export class HelloResolver {
  @mutation()
  @query()
  hello(): IQuery["hello"] & IMutation["hello"] {
    return "Hello, world!";
  }
}
