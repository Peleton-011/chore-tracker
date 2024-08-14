import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const TaskSchema = new Schema(
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

export default mongoose.models["Task"] || mongoose.model("Task", TaskSchema);
