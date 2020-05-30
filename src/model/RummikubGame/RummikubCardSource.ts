import { prop } from "@typegoose/typegoose";

export class RummikubCardSource {
  // if null, came from hand
  @prop()
  rowIndex?: number;

  @prop({ required: true })
  cardIndex!: number;

  constructor(init?: RummikubCardSource) {
    Object.assign(this, init);
  }
}
