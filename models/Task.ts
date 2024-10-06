import mongoose, { Schema, model } from "mongoose";

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface ITask {
	title: string;
	description?: string;
	date: Date;
	isCompleted: boolean;
	isImportant: boolean;
	user: Schema.Types.ObjectId;
}

export interface ITaskDocument extends ITask, mongoose.Document {}

const taskSchema = new Schema<ITask>(
	{
		title: { type: String, required: true },
		description: String,
		date: { type: Date, required: true },
		isCompleted: { type: Boolean, default: false },
		isImportant: { type: Boolean, default: false },
		user: { type: Schema.Types.ObjectId, required: true },
	},
	{
		timestamps: true, // adds createdAt and updatedAt fields automatically
	}
);

export default mongoose.models["Task"] || mongoose.model("Task", taskSchema);
