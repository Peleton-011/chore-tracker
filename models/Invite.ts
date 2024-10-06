import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const InviteSchema = new Schema({
	token: { type: String, required: true, unique: true },
	household: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
	expiresAt: { type: Date, required: true },
});

export default mongoose.models["Invite"] ||
	mongoose.model("Invite", InviteSchema);
