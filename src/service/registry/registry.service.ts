import { singleton } from "tsyringe";
import { ControllerRegistryService } from "./controllerRegistry.service";
import { ResolverRegistryService } from "./resolverRegistry.service";

@singleton()
export class RegistryService {
  constructor(
    readonly controllers: ControllerRegistryService,
    readonly resolvers: ResolverRegistryService
  ) { }
}
