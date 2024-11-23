import { NextResponse } from "next/server";
import { TaskTrade, Task } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function POST(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized", status: 401 });
        }

        const { taskId, toUserId } = await req.json();

        // Validate inputs
        if (!taskId || !toUserId) {
            return NextResponse.json({ error: "Missing fields", status: 400 });
        }

        // Ensure the task exists and belongs to the current user
        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: "Task not found", status: 404 });
        }
        if (task.user.toString() !== user._id.toString()) {
            return NextResponse.json({ error: "Unauthorized", status: 403 });
        }

        // Create trade request
        const tradeRequest = await TaskTrade.create({
            fromUser: user._id,
            toUser: toUserId,
            task: taskId,
            status: "pending",
        });

        return NextResponse.json({ tradeRequest, message: "Trade request sent" });
    } catch (error) {
        console.log("ERROR CREATING TRADE REQUEST", error);
        return NextResponse.json({ error: "Something went wrong", status: 500 });
    }
}
