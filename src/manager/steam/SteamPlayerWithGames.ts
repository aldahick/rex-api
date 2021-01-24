import { SteamGame } from "../../model/SteamGame";
import { SteamPlayer } from "../../service/steam";

export interface SteamPlayerWithGames {
  ownedGames?: SteamGame[];
  player: SteamPlayer;
}
