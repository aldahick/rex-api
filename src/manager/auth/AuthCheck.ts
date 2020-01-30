import { Query, Permission } from "accesscontrol";

export type AuthCheck = (query: Query) => Permission | Permission[];
