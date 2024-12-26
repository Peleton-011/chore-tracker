import { NextResponse } from "next/server";
import { TaskTrade, Task } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized", status: 401 });
        }

        const { tradeId, response } = await req.json(); // `response` is "accepted" or "declined"

        // Validate inputs
        if (!tradeId || !["accepted", "declined"].includes(response)) {
            return NextResponse.json({ error: "Invalid request", status: 400 });
        }

        // Find the trade request
        const trade = await TaskTrade.findById(tradeId).populate("task");
        if (!trade) {
            return NextResponse.json({ error: "Trade not found", status: 404 });
        }

        // Ensure the recipient is the current user
        if (trade.toUser.toString() !== user._id.toString()) {
            return NextResponse.json({ error: "Unauthorized", status: 403 });
        }

        // Update trade status and task ownership if accepted
        if (response === "accepted") {
            trade.status = "accepted";
            trade.task.user = user._id; // Update task ownership
            await trade.task.save();
        } else {
            trade.status = "declined";
        }

        await trade.save();
        return NextResponse.json({ trade, message: `Trade ${response}` });
    } catch (error) {
        console.log("ERROR RESPONDING TO TRADE", error);
        return NextResponse.json({ error: "Something went wrong", status: 500 });
    }
}
