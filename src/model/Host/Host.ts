import { prop } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";

export class Host {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  hostname!: string;

  @prop({ required: true })
  dockerEndpoint!: string;

  constructor(init?: Omit<Host, "_id">) {
    Object.assign(this, init);
  }
}
