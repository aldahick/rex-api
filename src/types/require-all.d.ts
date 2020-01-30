declare module "require-all" {
  export interface RequireAllOptions {
    dirname: string;
    filter?: string | RegExp | ((path: string) => (false | string));
    recursive?: boolean;
  }

  const requireAll: <T>(options: {
    dirname: string;
    filter?: string | RegExp | ((path: string) => (false | string));
    recursive?: boolean;
  }) => {[key: string]: T};

  // @ts-ignore
  export = requireAll;
}
