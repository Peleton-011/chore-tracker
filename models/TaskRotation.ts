import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const TaskRotationSchema = new Schema({
	household: { type: Schema.Types.ObjectId, ref: "Household" },
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	rotationSchedule: [[Boolean]],
	currentIndex: { type: Number, default: 0 },
});

export default mongoose.models["TaskRotation"] ||
	mongoose.model("TaskRotation", TaskRotationSchema);
