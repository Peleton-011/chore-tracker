import { NextResponse } from "next/server";
import { Task, RecurringTaskDefinition } from "@/models/index";
import { addMonths, subMonths, isAfter } from "date-fns";
import { getUser } from "@/app/utils/getUser";

// Remove completed tasks older than a month
export async function DELETE(req: Request) {
	try {
		const user = await getUser();

		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const oneMonthAgo = subMonths(new Date(), 1);

		const deletedTasks = await Task.deleteMany({
			isCompleted: true,
			date: { $lt: oneMonthAgo },
			user: user._id,
		});

        const deletedRecurringTasks = await RecurringTaskDefinition.deleteMany({
            owner: user._id,
            endDate: { $lt: oneMonthAgo },
        });

		return NextResponse.json({
			message: "Completed tasks older than a month have been deleted",
			deletedCount: deletedTasks.deletedCount + deletedRecurringTasks.deletedCount,
		});
	} catch (error) {
		console.error("Error removing completed tasks:", error);
		return NextResponse.json({ error: "Server error", status: 500 });
	}
}
