import { NextRequest, NextResponse } from "next/server";
import mongooseConnection from "@/app/utils/connect";
import { Invite, Household, User } from "@/models/index";
import { auth } from "@clerk/nextjs";

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
        const user = await User.findOne({userId});
		if (!household) {
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}


		if (!household.members.includes(user._id)) {
			household.members.push(user._id);
			await household.save();
		}

		if (!user.households.includes(household._id)) {
			user.households.push(household._id);
			await user.save();
		}

		return NextResponse.json({
			message: "User added to household",
			status: 200,
		});
	} catch (error) {
		console.error("Error adding user to household:", error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
