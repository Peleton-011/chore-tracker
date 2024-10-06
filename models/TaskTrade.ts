import mongoose, { Schema, model, InferSchemaType } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const taskTradeSchema = new Schema({
	fromUser: { type: Schema.Types.ObjectId, ref: "User" },
	toUser: { type: Schema.Types.ObjectId, ref: "User" },
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	tradeDate: { type: Date, default: Date.now },
});

export type taskTradeType = InferSchemaType<typeof taskTradeSchema>;

export default mongoose.models["TaskTrade"] ||
	mongoose.model("TaskTrade", taskTradeSchema);
