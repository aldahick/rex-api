import { IModule } from "../../IModule";
import { SteamResolver } from "./steam.resolver";
import { SteamGamesCommand } from "./steamGames.command";

export * from "./model";
export * from "./steamGame.manager";
export * from "./steamPlayer.manager";

export const steamModule: IModule = {
  commands: [SteamGamesCommand],
  resolvers: [SteamResolver]
};
