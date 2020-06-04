import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

export class Secret {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true, unique: true })
  key!: string;

  @prop({ required: true })
  value!: string;

  constructor(init?: Omit<Secret, "_id">) {
    Object.assign(this, init);
  }
}
