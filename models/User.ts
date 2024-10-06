import mongoose from "mongoose";
const { Schema, model } = mongoose;

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

const UserSchema = new Schema({
	username: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	// password: { type: String, required: true },
	households: [{ type: Schema.Types.ObjectId, ref: "Household" }],
	userId: { type: String, required: true, unique: true },
});

export default mongoose.models["User"] || model("User", UserSchema);
