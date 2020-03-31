import { prop } from "@typegoose/typegoose";

export class RummikubCard {
  @prop({ required: true })
  color!: string;

  @prop({ required: true })
  number!: number;
}
