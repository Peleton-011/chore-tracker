import { NextRequest, NextResponse } from "next/server";
import mongooseConnection from "@/app/utils/connect";
import { Household, User } from "@/models/index";
import mongoose, { ObjectId } from "mongoose";
import { getUser } from "@/app/utils/getUser";

export async function GET(req: NextRequest, res: NextResponse) {
	try {
		const user = await (await getUser()).populate("households");
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
	const session = await mongoose.startSession(); // Start a new session
	session.startTransaction(); // Start a transaction

	try {
		const { name } = await req.json();
        console.log(name)
		const user = await getUser(); // Attach session to query
		if (!user) {
			await session.abortTransaction(); // Abort transaction if user not found
			session.endSession(); // End the session
			return NextResponse.json({ error: "User not found", status: 404 });
		}

		const newHousehold = new Household({
			name,
			members: [user._id],
		});

		await newHousehold.save({ session }); // Save with the transaction session

		user.households.push(newHousehold._id);
		await user.save({ session }); // Save with the transaction session

		await session.commitTransaction(); // Commit the transaction if all goes well
		session.endSession(); // End the session

		return NextResponse.json({ household: newHousehold, status: 201 });
	} catch (error) {
		console.error(error);
		await session.abortTransaction(); // Abort the transaction in case of an error
		session.endSession(); // End the session
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}

export async function PUT(req: NextRequest, res: NextResponse) {
	const session = await mongoose.startSession(); // Start a new session
	session.startTransaction(); // Start a transaction

	try {
		const user = await getUser();

		const updates = await req.json();
		const { id, ...updateFields } = updates;

		if (!id) {
			await session.abortTransaction();
			session.endSession();
			return NextResponse.json({
				error: "Missing household ID",
				status: 400,
			});
		}

		const household = await Household.findById(id).session(session); // Attach session to the query

		if (!household) {
			await session.abortTransaction();
			session.endSession();
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		if (!user) {
			await session.abortTransaction();
			session.endSession();
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
			await session.abortTransaction();
			session.endSession();
			return new NextResponse("Unauthorized", { status: 401 });
		}

		Object.keys(updateFields).forEach((key) => {
			household[key] = updateFields[key];
		});

		await household.save({ session }); // Save the household with the transaction session

		await session.commitTransaction(); // Commit the transaction
		session.endSession(); // End the session

		return NextResponse.json(household);
	} catch (error) {
		console.error("ERROR UPDATING HOUSEHOLD: ", error);
		await session.abortTransaction(); // Abort the transaction in case of error
		session.endSession(); // End the session
		return NextResponse.json({
			error: "Error updating household",
			status: 500,
		});
	}
}
