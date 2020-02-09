import { prop } from "@typegoose/typegoose";

export class ContainerVolume {
  @prop({ required: true })
  hostPath!: string;

  @prop({ required: true })
  containerPath!: string;
}
