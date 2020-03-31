import { HttpError } from "../../util/HttpError";
import { ControllerPayload } from "../../service/registry";
import { AuthContext } from "./AuthContext";
import { AuthCheck } from "./AuthCheck";

export const guard = (check: AuthCheck): MethodDecorator => (target: any, key, descriptor: TypedPropertyDescriptor<any>) => {
  const old: Function = target[key];
  descriptor.value = async function(...args: [any, any, AuthContext] | [ControllerPayload]) {
    let context: AuthContext;
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
