import { prop } from "@typegoose/typegoose";
import { IRummikubCardColor } from "../../graphql/types";
import { RummikubCardSource } from "./RummikubCardSource";

export class RummikubCard {
  @prop({ required: true, enum: IRummikubCardColor })
  color!: IRummikubCardColor;

  @prop()
  value?: number;

  @prop({ _id: false })
  source?: RummikubCardSource;
}
