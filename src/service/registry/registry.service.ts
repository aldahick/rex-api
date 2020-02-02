import { ControllerRegistryService } from "./controllerRegistry.service";
import { ResolverRegistryService } from "./resolverRegistry.service";
import { singleton } from "tsyringe";

@singleton()
export class RegistryService {
  constructor(
    readonly controllers: ControllerRegistryService,
    readonly resolvers: ResolverRegistryService
  ) { }
}
