import { NextResponse } from "next/server";
import { TaskTrade } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function GET(req: Request) {
	try {
		// Fetch all trades if no "fromUser" query parameter is provided
		const trades = await TaskTrade.find();

		return NextResponse.json({ trades, status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
