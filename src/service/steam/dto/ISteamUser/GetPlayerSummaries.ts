/** some fields are missing because I'm too lazy to populate this whole thing */
export interface GetPlayerSummaries {
  response: {
    players: ({
      steamid: string;
      personaname: string;
      profileurl: string;
      avatarfull: string;
      gameid: string;
    } | undefined)[];
  };
}
