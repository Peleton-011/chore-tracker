import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function GET() {
	try {
		const user = await getUser();
		return NextResponse.json({ user, status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}

export async function POST(req: NextRequest, res: NextResponse) {
	const { userId, email, username, profilePic } = await req.json();

	try {
		const existingUser = await User.findOne({ userId });

		if (existingUser) {
			return NextResponse.json({
				message: "User already exists",
				user: existingUser,
				status: 200,
			});
		}

		const newUser = new User({ userId, email, username, profilePic });
		await newUser.save();

		return NextResponse.json({
			message: "User created successfully",
			user: newUser,
			status: 201,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
