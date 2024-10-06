import mongoose, { Schema, model, InferSchemaType } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const householdSchema = new Schema({
	name: { type: String, required: true },
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
	recurringTasks: [{ type: Schema.Types.ObjectId, ref: "RecurringTask" }],
});

export type householdType = InferSchemaType<typeof householdSchema>;

export default mongoose.models["Household"] ||
	mongoose.model("Household", householdSchema);
