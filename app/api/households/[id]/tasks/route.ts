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

		//Get household
		const household = await Household.findById(householdId).populate(
			"tasks"
		);

		console.log(household.tasks);

		return NextResponse.json(household.tasks);
	} catch (error) {
		console.log("ERROR GETTING TASKS: ", error);
		return NextResponse.json({ error: "Error updating task", status: 500 });
	}
}
