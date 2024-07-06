import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const TaskTradeSchema = new Schema({
	fromUser: { type: Schema.Types.ObjectId, ref: "User" },
	toUser: { type: Schema.Types.ObjectId, ref: "User" },
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	tradeDate: { type: Date, default: Date.now },
});

export default mongoose.models["TaskTrade"] ||
	mongoose.model("TaskTrade", TaskTradeSchema);
