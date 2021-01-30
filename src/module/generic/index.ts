import { IModule } from "../../IModule";
import { DateTimeScalarResolver } from "./datetime.resolver";
import { HelpCommand } from "./help.command";
import { PlayersCommand } from "./players.command";

export const genericModule: IModule = {
  commands: [HelpCommand, PlayersCommand],
  resolvers: [DateTimeScalarResolver]
};
