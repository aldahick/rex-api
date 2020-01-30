import { prop } from "@typegoose/typegoose";
import * as randomstring from "randomstring";

/* istanbul ignore next */
export const idProp = () => prop({
  required: true,
  default: randomstring.generate
});
