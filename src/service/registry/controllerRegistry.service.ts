import { HttpError } from "../../util/HttpError";
import { LoggerService } from "../logger";
import { Controller } from "./Controller";
import { singleton } from "tsyringe";
import * as express from "express";

@singleton()
export class ControllerRegistryService {
  constructor(
    private logger: LoggerService
  ) { }

  init(app: express.Application, controllers: Controller[]) {
    for (const controller of controllers) {
      const controllerName = controller.constructor.name;
      if (!controller.method) {
        throw new Error(`Missing method in controller ${controllerName}`);
      }
      if (!controller.route) {
        throw new Error(`Missing route in controller ${controllerName}`);
      }
      const matcher = app[controller.method].bind(app);
      matcher(controller.route, this.buildRequestHandler(controller));
      this.logger.info("controller.register", { method: controller.method, route: controller.route });
    }
  }

  /**
   * Do not use; only exported for testing
   */
  buildRequestHandler(controller: Controller) {
    return async (req: express.Request, res: express.Response) => {
      try {
        const result = await controller.handle({ req, res });
        if (result !== undefined) {
          res.contentType("json").send(JSON.stringify(result));
        }
      } catch (err) {
        if (err instanceof HttpError) {
          res.status(err.status);
        } else {
          this.logger.error("controller.uncaught", err, { method: controller.method, route: controller.route });
          res.status(500);
        }
        res.contentType("json").send(JSON.stringify({ message: err.message }));
      }
    };
  }
}
