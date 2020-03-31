import * as path from "path";
import { ApolloServer, IResolvers } from "apollo-server-express";
import * as express from "express";
import * as fs from "fs-extra";
import { GraphQLScalarType } from "graphql";
import * as recursiveReaddir from "recursive-readdir";
import { singleton } from "tsyringe";
import { ApolloContextManager } from "../../manager/apolloContext";
import { findDecoratedMethods } from "../../util/findDecoratedMethods";

@singleton()
export class ResolverRegistryService {
  private apollo?: ApolloServer;

  constructor(
    private apolloContextManager: ApolloContextManager
  ) { }

  async init(app: express.Application, resolverTargets: any[]) {
    const resolvers = this.buildResolvers(resolverTargets);
    const schemaDir = path.resolve(__dirname, "../../../graphql");
    this.apollo = new ApolloServer({
      typeDefs: (await Promise.all((await recursiveReaddir(schemaDir)).map(filename => fs.readFile(filename)))).join("\n"),
      resolvers,
      context: ctx => this.apolloContextManager.build(ctx.req)
    });
    this.apollo.applyMiddleware({ app });
  }

  buildResolvers(targets: any[]): IResolvers {
    const metadatas = findDecoratedMethods<{ name: string }, any>(targets, "resolver", v => v instanceof GraphQLScalarType);
    if (metadatas.length === 0) {
      throw new Error("No resolvers passed");
    }
    const resolvers: { [type: string]: { [field: string]: Function } } = { };

    metadatas.forEach(({ name, target, key, passedCustomCheck }) => {
      const [type, field] = name.split(".");
      if (!resolvers[type]) {
        resolvers[type] = { };
      }
      if (resolvers[type][field]) {
        throw new Error(`Duplicate resolver for ${type}.${field} found at ${target.constructor.name}.${key}`);
      }
      const value = (target as any)[key];
      // Don't bind if it's a Scalar
      (resolvers[type] as any)[field] = passedCustomCheck ? value : value.bind(target);
    });

    return resolvers;
  }
}
