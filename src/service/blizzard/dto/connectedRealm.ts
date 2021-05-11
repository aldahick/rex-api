import { BlizzardEnum, BlizzardRef } from "./blizzard";

export interface GetConnectedRealm {
  id: number;
  has_queue: boolean;
  status: BlizzardEnum;
  population: BlizzardEnum;
  realms: {
    id: number;
    region: BlizzardRef;
    name: string;
    category: string;
    locale: string;
    timezone: string;
    type: BlizzardEnum;
    is_tournament: boolean;
    slug: string;
  }[];
}

export interface GetConnectedRealms {
  connected_realms: {
    href: string;
  }[];
}
