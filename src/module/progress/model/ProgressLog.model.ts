import { prop } from "@typegoose/typegoose";

export class ProgressLog {
  @prop({ required: true })
  createdAt!: Date;

  @prop({ required: true })
  text!: string;

  constructor(init: ProgressLog) {
    Object.assign(this, init);
  }
}
