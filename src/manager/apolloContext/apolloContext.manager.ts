import { ApolloContext } from "./ApolloContext";
import { singleton } from "tsyringe";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";

@singleton()
export class ApolloContextManager {
  build({ req }: ExpressContext) {
    return new ApolloContext(req);
  }
}
