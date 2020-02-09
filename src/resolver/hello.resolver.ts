import { singleton } from "tsyringe";
import { IQuery, IMutation } from "../graphql/types";
import { query, mutation } from "../service/registry";

@singleton()
export class HelloResolver {
  @mutation()
  @query()
  hello(): IQuery["hello"] & IMutation["hello"] {
    return "Hello, world!";
  }
}
