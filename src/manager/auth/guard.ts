import { ApolloContext } from "../apolloContext/ApolloContext";
import { HttpError } from "../../util/HttpError";
import { AuthCheck } from "./AuthCheck";

export const guard = (check: AuthCheck): MethodDecorator => (target: any, key, descriptor: TypedPropertyDescriptor<any>) => {
  const old: Function = target[key];
  descriptor.value = async function(...args: [any, any, ApolloContext]) {
    const [, , context] = args;
    if (!await context.isAuthorized(check)) {
      throw HttpError.unauthorized();
    }
    return old.apply(this, args);
  };
};
