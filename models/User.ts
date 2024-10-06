import mongoose, { Schema, model, InferSchemaType } from "mongoose";

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const userSchema = new Schema({
	username: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	// password: { type: String, required: true },
	households: [{ type: Schema.Types.ObjectId, ref: "Household" }],
	userId: { type: String, required: true, unique: true },
});

export type userType = InferSchemaType<typeof userSchema>;

export default mongoose.models["User"] || model("User", userSchema);
