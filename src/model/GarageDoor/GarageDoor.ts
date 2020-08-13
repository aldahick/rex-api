import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

export class GarageDoor {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true, unique: true })
  name!: string;

  @prop({ required: true })
  isOpen!: boolean;

  constructor(init?: Omit<GarageDoor, "_id" | "toGqlObject">) {
    Object.assign(this, init);
  }
}
