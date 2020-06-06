export interface GetOwnedGames {
  response: {
    game_count: number;
    games?: {
      appid: number;
      playtime_forever: number;
      playtime_2weeks: number;
    }[];
  };
}
