import mongoose, { Model, Schema } from "mongoose";

import mongooseConnection from "@/app/utils/connect";

mongooseConnection();

interface IUser {
	username: String;
	email: String;
	// password: String,
	households: mongoose.Types.ObjectId[];
	userId: String;
}

export interface IUserDocument extends IUser, mongoose.Document {}

const userSchema: Schema<IUserDocument> = new Schema({
	username: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	// password: { type: String, required: true },
	households: [{ type: Schema.Types.ObjectId, ref: "Household" }],
	userId: { type: String, required: true, unique: true },
});

const User: Model<IUserDocument> =
	mongoose.models["User"] ||
	mongoose.model<IUserDocument>("User", userSchema);

export default User;
