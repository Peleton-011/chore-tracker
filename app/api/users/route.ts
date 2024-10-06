import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/index";
import { auth } from "@clerk/nextjs";

export async function GET () {
    try {
        const user = await User.findOne({ userId: auth().userId });
        return NextResponse.json({ user, status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error", status: 500 });
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
	const { userId, email, username } = await req.json();

	try {
		const existingUser = await User.findOne({ userId });

		if (existingUser) {
			return NextResponse.json({
				message: "User already exists",
				user: existingUser,
				status: 200,
			});
		}

		const newUser = new User({ userId, email, username });
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
	return NextResponse.json({ userId: auth().userId });
}
