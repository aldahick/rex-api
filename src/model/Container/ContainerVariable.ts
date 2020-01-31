import { prop } from "@typegoose/typegoose";

export class ContainerVariable {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  value!: string;
}
