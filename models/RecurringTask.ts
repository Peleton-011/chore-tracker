import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const RecurringTaskSchema = new Schema({
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	frequency: {
		type: String,
		enum: ["daily", "weekly", "monthly"],
		required: true,
	},
	startDate: { type: Date, required: true },
	endDate: { type: Date },
});

export default mongoose.models["RecurringTask"] ||
	mongoose.model("RecurringTask", RecurringTaskSchema);
