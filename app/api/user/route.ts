import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { User } from "@/models/index";
import { auth } from "@clerk/nextjs";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
	const { userId, email, username } = req.body;

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
