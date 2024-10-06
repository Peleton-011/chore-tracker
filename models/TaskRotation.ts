import mongoose, { Schema, model } from "mongoose";

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface ITaskRotation {
	task: Schema.Types.ObjectId;
	household: Schema.Types.ObjectId;
	rotationOrder: Schema.Types.ObjectId[];
	currentIndex: number;
}

export interface ITaskRotationDocument extends ITaskRotation, mongoose.Document {}

const taskRotationSchema = new Schema<ITaskRotation>({
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	household: { type: Schema.Types.ObjectId, ref: "Household" },
	rotationOrder: [{ type: Schema.Types.ObjectId, ref: "User" }],
	currentIndex: { type: Number, default: 0 },
});

export default mongoose.models["TaskRotation"] ||
	mongoose.model("TaskRotation", taskRotationSchema);
