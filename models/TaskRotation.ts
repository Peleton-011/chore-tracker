import mongoose, { Schema, model, InferSchemaType } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const taskRotationSchema = new Schema({
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	household: { type: Schema.Types.ObjectId, ref: "Household" },
	rotationOrder: [{ type: Schema.Types.ObjectId, ref: "User" }],
	currentIndex: { type: Number, default: 0 },
});

export type taskRotationType = InferSchemaType<typeof taskRotationSchema>;

export default mongoose.models["TaskRotation"] ||
	mongoose.model("TaskRotation", taskRotationSchema);
