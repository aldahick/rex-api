import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

import { IProgress, IProgressStatus } from "../../../graphql";
import { ProgressLog } from "./ProgressLog.model";

export class Progress {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  action!: string;

  @prop({ required: true })
  createdAt!: Date;

  @prop({ required: true, enum: IProgressStatus })
  status!: IProgressStatus;

  @prop({ required: true, type: ProgressLog, _id: false })
  logs!: ProgressLog[];

  constructor(init?: Omit<Progress, "_id" | "toGqlObject">) {
    Object.assign(this, init);
  }

  toGqlObject(): IProgress {
    return {
      _id: this._id,
      action: this.action,
      createdAt: this.createdAt,
      status: this.status,
      logs: this.logs
    };
  }
}
