import mongoose, { Schema, model } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface IRecurringTask {
    task: Schema.Types.ObjectId;
    frequency: string;
    startDate: Date;
    endDate?: Date;
}

export interface IRecurringTaskDocument extends IRecurringTask, mongoose.Document {}

const recurringTaskSchema = new Schema<IRecurringTask>({
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
	mongoose.model("RecurringTask", recurringTaskSchema);
