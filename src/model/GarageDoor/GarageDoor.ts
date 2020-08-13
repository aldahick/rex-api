import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";
import { IGarageDoor } from "../../graphql/types";

export class GarageDoor {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  isOpen!: boolean;

  constructor(init?: Omit<GarageDoor, "_id" | "toGqlObject">) {
    Object.assign(this, init);
  }

  toGqlObject(): IGarageDoor {
    return {
      ...this,
      id: this._id
    };
  }
}
