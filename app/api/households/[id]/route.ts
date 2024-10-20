import mongoose, { ObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { getUser } from "@/app/utils/getUser";
import { Household, User } from "@/models/index";

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await mongoose.startSession(); // Start a session
	session.startTransaction(); // Start a transaction

	try {
		const { id } = params;
		const user = await getUser();

		let household = await Household.findById(id as string).session(session); // Use session for transaction

		if (!user) {
			await session.abortTransaction(); // Abort if user is not found
			session.endSession();
			return NextResponse.json({
				error: "User not found",
				status: 404,
			});
		}

		if (
			!household?.members
				.map((memberId: ObjectId) => memberId.toString())
				.includes(user._id.toString())
		) {
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
		user.households = user.households.filter(
			(_id: ObjectId) => _id.toString() !== household._id.toString()
		);
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params; // Household ID
		const user = await getUser(); // Get the authenticated user

		if (!user) {
			return NextResponse.json({
				error: "User not authenticated",
				status: 401,
			});
		}

		// Fetch the household by ID and populate the members and tasks
		const household = await Household.findById(id)
			.populate("members") // Populate members, only select name and email fields
			.populate("tasks") // Populate tasks (assuming tasks are referenced in the household)
			.exec();

		// Check if the household exists
		if (!household) {
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		// Ensure that the user is part of the household
		const isMember = household.members.some(
			(member: any) => member._id.toString() === user._id.toString()
		);

		if (!isMember) {
			return NextResponse.json({
				error: "Unauthorized",
				status: 403,
			});
		}

		// Return the populated household document
		return NextResponse.json(household);
	} catch (error: any) {
		console.log("ERROR FETCHING HOUSEHOLD: ", error.message, error.stack);
		return NextResponse.json({
			error: "Error fetching household",
			status: 500,
		});
	}
}