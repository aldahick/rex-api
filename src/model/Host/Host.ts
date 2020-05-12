import { prop } from "@typegoose/typegoose";
import { MongoService } from "@athenajs/core";

export class Host {
  @MongoService.idProp()
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
