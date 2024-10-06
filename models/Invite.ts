import mongoose, { Schema, model } from "mongoose";

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface IInvite {
	token: string;
	household: Schema.Types.ObjectId;
	expiresAt: Date;
}

export interface IInviteDocument extends IInvite, mongoose.Document {}

const inviteSchema = new Schema<IInvite>({
	token: { type: String, required: true, unique: true },
	household: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
	expiresAt: { type: Date, required: true },
});

export default mongoose.models["Invite"] ||
	mongoose.model("Invite", inviteSchema);
