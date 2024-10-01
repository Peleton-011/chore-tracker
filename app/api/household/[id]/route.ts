import mongoose, { ObjectId } from "mongoose";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Household, User } from "@/models/index";

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await mongoose.startSession(); // Start a session
	session.startTransaction(); // Start a transaction

	try {
		const { id } = params;
		const { userId } = auth();

		let household = await Household.findById(id as string).session(session); // Use session for transaction

		const user = await User.findOne({ userId }).session(session); // Use session for transaction

		if (!user) {
			await session.abortTransaction(); // Abort if user is not found
			session.endSession();
			return NextResponse.json({
				error: "User not found",
				status: 404,
			});
		}

		if (!household?.members.map((memberId: ObjectId) => memberId.toString()).includes(user._id.toString())) {
			await session.abortTransaction(); // Abort if unauthorized
			session.endSession();
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Delete the household
		household = await Household.findByIdAndDelete(id).session(session); // Use session

		if (!household) {
			await session.abortTransaction(); // Abort if household not found
			session.endSession();
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		// Remove household from user's households array
		user.households.pull(household._id);
		await user.save({ session }); // Save using session

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		return NextResponse.json(household);
	} catch (error) {
		console.log("ERROR DELETING HOUSEHOLD: ", error);
		await session.abortTransaction(); // Abort the transaction on error
		session.endSession();
		return NextResponse.json({
			error: "Error deleting household",
			status: 500,
		});
	}
}
