import { NextRequest, NextResponse } from "next/server";
import mongooseConnection from "@/app/utils/connect";
import { Household, User } from "@/models/index";
import { auth } from "@clerk/nextjs";
import { ObjectId } from "mongoose";

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
	const { name } = await req.json();

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

export async function PUT(req: NextRequest, res: NextResponse) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized", status: 401 });
		}

		const updates = await req.json();
		const { id, ...updateFields } = updates;

		if (!id) {
			return NextResponse.json({
				error: "Missing household ID",
				status: 400,
			});
		}

		const household = await Household.findById(id);

		console.log(household);
		if (!household) {
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		const user = await User.findOne({ userId });

		if (!user) {
			return NextResponse.json({
				error: "User not found",
				status: 404,
			});
		}

		if (
			!household.members
				.map((id: ObjectId) => id.toString())
				.includes(user._id.toString())
		) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		console.log(updateFields);

		Object.keys(updateFields).forEach((key) => {
			household[key] = updateFields[key];
		});

        console.log

		await household.save();

		return NextResponse.json(household);
	} catch (error) {
		console.log("ERROR UPDATING HOUSEHOLD: ", error);
		return NextResponse.json({
			error: "Error updating household",
			status: 500,
		});
	}
}
