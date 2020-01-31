import { prop } from "@typegoose/typegoose";

export class ContainerPort {
  @prop({ required: true })
  containerPort!: number;

  @prop()
  hostPort?: number;

  @prop()
  hostBindIp?: string;
}
