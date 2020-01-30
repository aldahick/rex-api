import { singleton } from "tsyringe";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { ApolloContext } from "./ApolloContext";

@singleton()
export class ApolloContextManager {
  build({ req }: ExpressContext) {
    return new ApolloContext(req);
  }
}
