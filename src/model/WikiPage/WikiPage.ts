import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

export class WikiPage {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true, unique: true })
  name!: string;

  @prop()
  firstLinkName!: string;

  constructor(init?: Omit<WikiPage, "_id">) {
    Object.assign(this, init);
  }
}
