import { IModule } from "../../IModule";
import { LeagueCommand } from "./league.command";

export * from "./league.manager";

export const leagueModule: IModule = {
  commands: [LeagueCommand]
};
