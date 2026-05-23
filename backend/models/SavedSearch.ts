import { Schema, model, Document, Types } from "mongoose";

export interface ISavedSearch extends Document {
  userId: Types.ObjectId;
  name: string;
  query: string;             // full querystring (after `?`) or empty
  path: string;              // pathname e.g. "/search/escorts"
  filters: Record<string, any>;
  createdAt: Date;
  lastNotifiedAt?: Date;
  lastResultCount?: number;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    query: { type: String, default: "" },
    path: { type: String, required: true },
    filters: { type: Schema.Types.Mixed, default: {} },
    lastNotifiedAt: { type: Date },
    lastResultCount: { type: Number },
  },
  { timestamps: true }
);

SavedSearchSchema.index({ userId: 1, createdAt: -1 });

export default model<ISavedSearch>("SavedSearch", SavedSearchSchema);
