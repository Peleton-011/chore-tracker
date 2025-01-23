import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const RecurringTaskDefinitionSchema = new mongoose.Schema({
	title: String,
	description: String,
	owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	intervalUnit: {
		type: String,
		enum: ["minutes", "hours", "days", "weeks", "months", "years"],
	},
	intervalValue: Number,
	startDate: Date,
	endDate: Date, // Can be null if infinite
	nextOccurrence: Date, // Tracks the next instance
	allowFutureTrades: { type: Boolean, default: false },
	household: { type: mongoose.Schema.Types.ObjectId, ref: "Household" }, // For group tasks
});

export default mongoose.models["RecurringTaskDefinition"] ||
	mongoose.model("RecurringTaskDefinition", RecurringTaskDefinitionSchema);
