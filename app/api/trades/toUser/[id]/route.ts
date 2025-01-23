import { NextResponse } from "next/server";
import { TaskTrade } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function GET(
	req: Request,
	{ params }: { params: { toUser: string } }
) {
	try {
		// Extract the query parameters
		const { toUser } = params;

		// Fetch trades where "toUser" matches the query parameter
		const trades = await TaskTrade.find({ toUser });

		return NextResponse.json({ trades, status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
