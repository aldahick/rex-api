import { singleton } from "tsyringe";
import { ControllerRegistryService } from "./controllerRegistry.service";
import { ResolverRegistryService } from "./resolverRegistry.service";
import { WebsocketRegistryService } from "./websocketRegistry.service";

@singleton()
export class RegistryService {
  constructor(
    readonly controllers: ControllerRegistryService,
    readonly resolvers: ResolverRegistryService,
    readonly websockets: WebsocketRegistryService
  ) { }
}
