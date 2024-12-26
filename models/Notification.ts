import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const NotificationSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User" },
	title: { type: String, required: true },
	message: { type: String, required: true },
	read: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models["Notification"] ||
	mongoose.model("Notification", NotificationSchema);
