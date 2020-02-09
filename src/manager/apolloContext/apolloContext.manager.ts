import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { singleton } from "tsyringe";
import { ApolloContext } from "./ApolloContext";

@singleton()
export class ApolloContextManager {
  build({ req }: ExpressContext) {
    return new ApolloContext(req);
  }
}
