import { prop } from "@typegoose/typegoose";

export class HostDocker {
  @prop({ required: true })
  hostname!: string;

  @prop({ required: true })
  path!: string;

  @prop({ required: true })
  username!: string;

  @prop({ required: true })
  password!: string;
}
