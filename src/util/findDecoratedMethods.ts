import * as _ from "lodash";

export const findDecoratedMethods = <Metadata, Target extends any>(
  targets: Target[],
  metadataKey: string,
  customCheck?: (property: any) => boolean
): (Metadata & {
  target: Target;
  key: string;
  passedCustomCheck: boolean;
})[] =>
  _.compact(_.flatten(targets.map(target => {
    // ...(target) gets properties such as: x = () => { }
    // ...(target.constructor.prototype) gets methods such as: x() { }
    const keys = Object.getOwnPropertyNames(target).concat(Object.getOwnPropertyNames(target.constructor.prototype));
    return keys.map(key => {
      if (!Reflect.hasMetadata(metadataKey, target, key)) { return; }
      const passedCustomCheck = customCheck && customCheck((target as any)[key]);
      if (typeof((target as any)[key]) !== "function" && !passedCustomCheck) {
        throw new Error(`Expected ${target}.${key} to be a function or pass the check`);
      }
      return {
        ...Reflect.getMetadata(metadataKey, target, key),
        target, key,
        passedCustomCheck
      };
    });
  })));
