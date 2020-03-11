import { prop } from "@typegoose/typegoose";

export class SteamGame {
  @prop({ required: true })
  _id!: number;

  @prop({ required: true })
  name!: string;

  constructor(init: SteamGame) {
    Object.assign(this, init);
  }
}
