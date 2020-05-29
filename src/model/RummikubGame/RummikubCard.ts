import { prop } from "@typegoose/typegoose";
import { IRummikubCardColor } from "../../graphql/types";

export class RummikubCard {
  @prop({ required: true, enum: IRummikubCardColor })
  color!: IRummikubCardColor;

  @prop()
  value?: number;
}
