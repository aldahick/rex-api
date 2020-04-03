/* eslint-disable no-console */

import "reflect-metadata";
import "source-map-support/register";
import { container } from "tsyringe";
import { Application } from "./app";

const main = async () => {
  const app = container.resolve(Application);
  await app.init();
  await app.start();
};

const stop = (err?: any) => {
  if (err instanceof Error) {
    console.error(err);
  }
  const app = container.resolve(Application);
  app.stop().catch(console.error);
};

main().catch(console.error);

process
  .on("SIGINT", stop)
  .on("uncaughtException", stop)
  .on("unhandledRejection", stop);
