import { IModule } from "../../IModule";
import { NoteResolver } from "./note.resolver";

export * from "./note.manager";

export const noteModule: IModule = {
  resolvers: [NoteResolver]
};
