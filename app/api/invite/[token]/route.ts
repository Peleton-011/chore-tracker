import { NextRequest, NextResponse } from "next/server";
import mongooseConnection from "@/app/utils/connect";
import { Invite, Household, User } from "@/models/index";
import { auth } from "@clerk/nextjs";
import mongoose from "mongoose";

export async function GET(
	req: NextRequest,
	{ params }: { params: { token: string } }
) {
	try {
		const { token } = params;

		if (!token) {
			return NextResponse.json({
				error: "Token is required",
				status: 400,
			});
		}

		const invite = await Invite.findOne({ token });
		if (!invite) {
			return NextResponse.json({
				error: "Invalid invite token",
				status: 404,
			});
		}

		if (invite.expiresAt < new Date()) {
			return NextResponse.json({
				error: "Invite link has expired",
				status: 400,
			});
		}

		const household = await Household.findById(invite.household);
		if (!household) {
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		return NextResponse.json({
			household,
			inviteToken: token,
			status: 200,
		});
	} catch (error) {
		console.error("Error fetching invite details:", error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: { token: string } }
) {
	// Start a session
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { token } = params;
		const { userId } = auth();
        console.log(token)

		if (!token) {
			return NextResponse.json({
				error: "Token is required",
				status: 400,
			});
		}

		const invite = await Invite.findOne({ token }).session(session);
		if (!invite) {
			await session.abortTransaction();
			session.endSession();
			return NextResponse.json({
				error: "Invalid invite token",
				status: 404,
			});
		}

		if (invite.expiresAt < new Date()) {
			await session.abortTransaction();
			session.endSession();
			return NextResponse.json({
				error: "Invite link has expired",
				status: 400,
			});
		}
        
		const household = await Household.findById(invite.household).session(session);
        const user = await User.findOne({userId}).session(session);
		if (!household) {
			await session.abortTransaction();
			session.endSession();
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		// Update household members if user is not already a member
		if (!household.members.includes(user._id)) {
			household.members.push(user._id);
			await household.save({ session });
		}

		// Update user's households if the household is not already included
		if (!user.households.includes(household._id)) {
			user.households.push(household._id);
			await user.save({ session });
		}

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		return NextResponse.json({
			message: "User added to household",
			status: 200,
		});
	} catch (error) {
		console.error("Error adding user to household:", error);

		// Abort the transaction if there is an error
		await session.abortTransaction();
		session.endSession();

		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
