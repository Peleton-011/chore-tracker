import { NextResponse } from "next/server";
import { TaskTrade } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function GET(req: Request) {
	try {
		// Extract the query parameters
		const url = new URL(req.url);
		const fromUser = url.searchParams.get("fromUser");
		const toUser = url.searchParams.get("toUser");

		let trades;

		if (fromUser) {
			// Fetch trades where "fromUser" matches the query parameter
			trades = await TaskTrade.find({ fromUser });
		} else if (toUser) {
			// Fetch trades where "toUser" matches the query parameter
			trades = await TaskTrade.find({ toUser });
		} else {
			// Fetch all trades if no "fromUser" query parameter is provided
			trades = await TaskTrade.find();
		}

		return NextResponse.json({ trades, status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
