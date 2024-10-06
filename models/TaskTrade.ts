import mongoose, { Schema, model } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface ITaskTrade {
    fromUser: Schema.Types.ObjectId;
    toUser: Schema.Types.ObjectId;
    task: Schema.Types.ObjectId;
    tradeDate: Date;
}


export interface ITaskTradeDocument extends ITaskTrade, mongoose.Document {};

const taskTradeSchema = new Schema<ITaskTrade>({
	fromUser: { type: Schema.Types.ObjectId, ref: "User" },
	toUser: { type: Schema.Types.ObjectId, ref: "User" },
	task: { type: Schema.Types.ObjectId, ref: "Task" },
	tradeDate: { type: Date, default: Date.now },
});


export default mongoose.models["TaskTrade"] ||
	mongoose.model("TaskTrade", taskTradeSchema);
