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
		user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
		household: { type: mongoose.Types.ObjectId, ref: "Household" },

		// Optional array of objects with user: userid and date: completion date
		completions: [ 
			{ 
				user: {
					type: mongoose.Types.ObjectId,
					ref: "User",
					required: true,
				},
				date: { type: Date, required: true },
			},
            
		],

		recurringTaskDefinition: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "RecurringTaskDefinition",
		},
		isPlaceholder: { type: Boolean, default: false },
		reminders: [
			{
				type: {
					type: String,
					enum: ["before", "after"],
					required: true,
				},
				offsetMinutes: { type: Number, required: true },
				notified: { type: Boolean, default: false },
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.models["Task"] || mongoose.model("Task", TaskSchema);
