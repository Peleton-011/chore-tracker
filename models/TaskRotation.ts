import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const TaskRotationSchema = new Schema({
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	household: { type: Schema.Types.ObjectId, ref: "Household" },
	rotationOrder: [{ type: Schema.Types.ObjectId, ref: "User" }],
	currentIndex: { type: Number, default: 0 },
});

export default mongoose.models["TaskRotation"] ||
	mongoose.model("TaskRotation", TaskRotationSchema);
