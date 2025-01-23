import { NextResponse } from "next/server";
import { TaskTrade } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function GET(
	req: Request,
	{ params }: { params: { fromUser: string } }
) {
	try {
		// Extract the query parameters
		const { fromUser } = params;

		// Fetch trades where "fromUser" matches the query parameter
		const trades = await TaskTrade.find({ fromUser });

		return NextResponse.json({ trades, status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
