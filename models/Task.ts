import mongoose, { Schema, model, InferSchemaType } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const taskSchema = new Schema(
	{
		title: { type: String, required: true },
		description: String,
		date: { type: Date, required: true },
		isCompleted: { type: Boolean, default: false },
		isImportant: { type: Boolean, default: false },
		userId: { type: String, required: true },
	},
	{
		timestamps: true, // adds createdAt and updatedAt fields automatically
	}
);

export type taskType = InferSchemaType<typeof taskSchema>;

export default mongoose.models["Task"] || mongoose.model("Task", taskSchema);
