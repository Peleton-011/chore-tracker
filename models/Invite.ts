import mongoose, { Schema, model, InferSchemaType } from "mongoose";


import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const inviteSchema = new Schema({
	token: { type: String, required: true, unique: true },
	household: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
	expiresAt: { type: Date, required: true },
});

export type inviteType = InferSchemaType<typeof inviteSchema>;

export default mongoose.models["Invite"] ||
	mongoose.model("Invite", inviteSchema);
