import { prop, arrayProp } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";
import { ContainerPort } from "./ContainerPort";
import { ContainerVariable } from "./ContainerVariable";

export class Container {
  @idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  image!: string;

  @prop({ required: true })
  tag!: string;

  @prop({ required: true })
  hostId!: string;

  @arrayProp({ required: true, items: ContainerPort, _id: false })
  ports!: ContainerPort[];

  @arrayProp({ required: true, items: ContainerVariable, _id: false })
  variables!: ContainerVariable[];

  constructor(init?: Omit<Container, "_id">) {
    Object.assign(this, init);
  }
}
