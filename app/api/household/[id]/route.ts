import mongoose, { ObjectId } from "mongoose";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Household, User } from "@/models/index";

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		const { userId } = auth();

		let household = await Household.findById(id as string);

		const user = await User.findOne({ userId });

		if (!user) {
			return NextResponse.json({
				error: "User not found",
				status: 404,
			});
		}

		if (!household.members.map((id: ObjectId )=> id.toString()).includes(user._id.toString())) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		//Delete the household

		household = await Household.findByIdAndDelete(id);

		if (!household) {
			return NextResponse.json({
				error: "Household not found",
				status: 404,
			});
		}

		user.households.pull(household._id);
		await user.save();
		await household.delete();

		return NextResponse.json(household);
	} catch (error) {
		console.log("ERROR DELETING HOUSEHOLD: ", error);
		return NextResponse.json({
			error: "Error deleting household",
			status: 500,
		});
	}
}
