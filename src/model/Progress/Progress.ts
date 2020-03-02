import { prop, arrayProp } from "@typegoose/typegoose";
import { idProp } from "../../util/mongo";
import { IProgress, IProgressStatus } from "../../graphql/types";
import { ProgressLog } from "./ProgressLog";
import { ProgressStatus } from "./ProgressStatus";

export class Progress {
  @idProp()
  _id!: string;

  @prop({ required: true })
  action!: string;

  @prop({ required: true })
  createdAt!: Date;

  @prop({ required: true, enum: ProgressStatus })
  status!: ProgressStatus;

  @arrayProp({ required: true, items: ProgressLog, _id: false })
  logs!: ProgressLog[];

  constructor(init?: Omit<Progress, "_id" | "toGqlObject">) {
    Object.assign(this, init);
  }

  toGqlObject(): IProgress {
    return {
      _id: this._id,
      action: this.action,
      createdAt: this.createdAt,
      status: this.gqlStatus,
      logs: this.logs
    };
  }

  private get gqlStatus(): IProgressStatus {
    switch (this.status) {
      case ProgressStatus.Complete: return IProgressStatus.Complete;
      case ProgressStatus.Created: return IProgressStatus.Created;
      case ProgressStatus.Errored: return IProgressStatus.Errored;
      case ProgressStatus.InProgress: return IProgressStatus.InProgress;
      default: throw new Error(`unknown status value ${this.status}`);
    }
  }
}