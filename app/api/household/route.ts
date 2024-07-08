import { NextRequest, NextResponse } from "next/server";
import mongooseConnection from "@/app/utils/connect";
import { Household, User } from "@/models/index";
import { auth } from "@clerk/nextjs";

export async function GET(req: NextRequest, res: NextResponse) {
	try {
		const user = await User.findOne({ userId: auth().userId }).populate(
			"households"
		);
		if (!user) {
			return NextResponse.json({ error: "User not found", status: 404 });
		}

		return NextResponse.json({ households: user.households, status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}

export async function POST(req: NextRequest, res: NextResponse) {
	// return NextResponse.json({ ass: auth() });
	const { name } = req.body;

	try {
		const user = await User.findOne({ userId: auth().userId });
		if (!user) {
			return NextResponse.json({ error: "User not found", status: 404 });
		}

		const newHousehold = new Household({
			name,
			members: [user._id],
		});
		await newHousehold.save();

		user.households.push(newHousehold._id);
		await user.save();

		return NextResponse.json({ household: newHousehold, status: 201 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
