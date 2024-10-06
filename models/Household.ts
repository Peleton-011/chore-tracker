import mongoose, { Schema, model } from "mongoose";

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface IHousehold {
	name: string;
	members: Schema.Types.ObjectId[];
	tasks: Schema.Types.ObjectId[];
	recurringTasks: Schema.Types.ObjectId[];
}

export interface IHouseholdDocument extends IHousehold, Document {}

const householdSchema = new Schema<IHousehold>({
	name: { type: String, required: true },
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
	recurringTasks: [{ type: Schema.Types.ObjectId, ref: "RecurringTask" }],
});

export default mongoose.models["Household"] ||
	mongoose.model("Household", householdSchema);
