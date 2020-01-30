export const query = (name?: string) => define(key => `Query.${name || key}`);
export const mutation = (name?: string) => define(key => `Mutation.${name || key}`);
export const resolver = (name: string) => define(() => name);

const define = (buildName: (key: string) => string) => (target: any, key: string) => {
  Reflect.defineMetadata("resolver", { name: buildName(key) }, target, key);
};
