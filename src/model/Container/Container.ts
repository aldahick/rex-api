import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";
import { ContainerPort } from "./ContainerPort";
import { ContainerVariable } from "./ContainerVariable";
import { ContainerVolume } from "./ContainerVolume";

export class Container {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  image!: string;

  @prop({ required: true })
  tag!: string;

  @prop({ required: true })
  dockerId!: string;

  @prop({ required: true })
  hostId!: string;

  @prop({ required: true })
  networkName!: string;

  @prop({ required: true, type: ContainerPort, _id: false })
  ports!: ContainerPort[];

  @prop({ required: true, type: ContainerVariable, _id: false })
  variables!: ContainerVariable[];

  @prop({ required: true, type: ContainerVolume, _id: false })
  volumes!: ContainerVolume[];

  constructor(init?: Omit<Container, "_id">) {
    Object.assign(this, init);
  }
}
