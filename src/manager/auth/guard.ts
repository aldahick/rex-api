import { HttpError } from "../../util/HttpError";
import { ApolloContext } from "../apolloContext/ApolloContext";
import { ControllerPayload } from "../../service/registry";
import { AuthCheck } from "./AuthCheck";

export const guard = (check: AuthCheck): MethodDecorator => (target: any, key, descriptor: TypedPropertyDescriptor<any>) => {
  const old: Function = target[key];
  descriptor.value = async function(...args: [any, any, ApolloContext] | [ControllerPayload]) {
    let context: ApolloContext;
    if (args.length === 1) { // controller
      context = args[0].context;
    } else {
      context = args[2];
    }
    if (!await context.isAuthorized(check)) {
      throw HttpError.unauthorized();
    }
    return old.apply(this, args);
  };
};
