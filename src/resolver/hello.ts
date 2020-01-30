import { singleton } from "tsyringe";
import { query } from "../service/registry";

@singleton()
export class HelloResolver {
  @query()
  hello(): string {
    return "Hello, world!";
  }
}
