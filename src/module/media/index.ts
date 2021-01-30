import { IModule } from "../../IModule";
import { MediaController } from "./media.controller";
import { MediaResolver } from "./media.resolver";

export * from "./media.manager";

export const mediaModule: IModule = {
  controllers: [MediaController],
  resolvers: [MediaResolver]
};
