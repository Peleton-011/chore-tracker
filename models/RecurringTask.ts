import mongoose, { Schema, model, InferSchemaType } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const recurringTaskSchema = new Schema({
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	frequency: {
		type: String,
		enum: ["daily", "weekly", "monthly"],
		required: true,
	},
	startDate: { type: Date, required: true },
	endDate: { type: Date },
});

export type recurringTaskType = InferSchemaType<typeof recurringTaskSchema>;

export default mongoose.models["RecurringTask"] ||
	mongoose.model("RecurringTask", recurringTaskSchema);
