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

		// Custom recurrence fields
		isRecurring: { type: Boolean, default: false },
		intervalValue: {
			type: Number,
			validate: {
				validator: function (this: any) {
					// Only require `intervalValue` if `isRecurring` is true
					return (
						!this.isRecurring ||
						(this.isRecurring && this.intervalValue != null)
					);
				},
				message: "intervalValue is required if the task is recurring",
			},
		},
		intervalUnit: {
			type: String,
			enum: ["minutes", "hours", "days", "weeks", "months", "years"],
			validate: {
				validator: function (this: any) {
					// Only require `intervalUnit` if `isRecurring` is true
					return (
						!this.isRecurring ||
						(this.isRecurring && this.intervalUnit != null)
					);
				},
				message: "intervalUnit is required if the task is recurring",
			},
		},
		recurrenceEndDate: Date,
		nextOccurrence: Date,
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
