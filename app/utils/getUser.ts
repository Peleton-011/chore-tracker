// utils/getUser.ts
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { User } from "@/models/index";
// Define a custom error for user not found
class UserNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserNotFoundError";
	}
}

// Define the function with proper types
export const getUser = async () => {
	try {
		const { userId } = await auth();

		// if (!mongoose.Types.ObjectId.isValid(userId)) {
		// 	throw new Error("Invalid user ID");
		// }

		const user = await User.findOne({ userId }).exec(); // Ensure it executes as a promise

		if (!user) {
			throw new UserNotFoundError("User not found");
		}

		return user;
	} catch (error) {
		throw error; // Error should be caught and handled by the caller
	}
};
