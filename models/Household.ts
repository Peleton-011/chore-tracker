import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const HouseholdSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String },
	image: { type: String },
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
	recurringTasks: [{ type: Schema.Types.ObjectId, ref: "RecurringTask" }],
});

export default mongoose.models["Household"] ||
	mongoose.model("Household", HouseholdSchema);
