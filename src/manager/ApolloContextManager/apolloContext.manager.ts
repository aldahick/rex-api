import { singleton } from "tsyringe";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";

@singleton()
export class ApolloContextManager {
  build({ }: ExpressContext) {
    return {};
  }
}
