import { MongoService } from "@athenajs/core";
import { prop } from "@typegoose/typegoose";

import { IProgress, IProgressStatus } from "../../graphql/types";
import { ProgressLog } from "./ProgressLog";
import { ProgressStatus } from "./ProgressStatus";

export class Progress {
  @MongoService.idProp()
  _id!: string;

  @prop({ required: true })
  action!: string;

  @prop({ required: true })
  createdAt!: Date;

  @prop({ required: true, enum: ProgressStatus })
  status!: ProgressStatus;

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
      status: this.gqlStatus,
      logs: this.logs
    };
  }

  private get gqlStatus(): IProgressStatus {
    switch (this.status) {
      case ProgressStatus.completed: return IProgressStatus.Complete;
      case ProgressStatus.created: return IProgressStatus.Created;
      case ProgressStatus.errored: return IProgressStatus.Errored;
      case ProgressStatus.inProgress: return IProgressStatus.InProgress;
    }
  }
}
