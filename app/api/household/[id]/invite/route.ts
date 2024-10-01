import crypto from "crypto";
import mongooseConnection from "@/app/utils/connect";
import { Invite, Household } from "@/models/index";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function POST(
	req: Request,
	{ params }: { params: { id: string } }
) {

    const { id: householdId } = params;
    
	try {
		const household = await Household.findById(householdId);
		if (!household) {
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		const token = crypto.randomBytes(3).toString("hex");
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7);

		const invite = new Invite({
			token,
			household: household._id,
			expiresAt,
		});
		await invite.save();

		const inviteLink = `${req.headers.get("origin")}/invite/${token}`;

		return NextResponse.json({ inviteLink, status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
