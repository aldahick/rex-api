import { prop } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";

export class WikiPage {
  @idProp()
  _id!: string;

  @prop({ required: true, unique: true })
  name!: string;

  @prop()
  firstLinkName!: string;

  constructor(init?: Omit<WikiPage, "_id">) {
    Object.assign(this, init);
  }
}
