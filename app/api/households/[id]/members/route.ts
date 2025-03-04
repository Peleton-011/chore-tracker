import { NextResponse } from "next/server";
import { Household } from "@/models/index";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id: householdId } = params;
	try {
		if (!householdId) {
			return NextResponse.json({
				error: "Household ID is required",
				status: 401,
			});
		}

		//Get household with members and the members' profilePic attributes
		const household = await Household.findById(householdId).populate(
            "members"
		);

		// console.log(household.members);

		return NextResponse.json(household.members);
	} catch (error) {
		console.log("ERROR GETTING MEMBERS: ", error);
		return NextResponse.json({ error: "Error getting members", status: 500 });
	}
}
