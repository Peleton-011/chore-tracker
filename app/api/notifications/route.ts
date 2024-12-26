import { NextResponse } from "next/server";
import { Notification } from "@/models/index";
import { getUser } from "@/app/utils/getUser";

export async function GET() {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized", status: 401 });
        }

        const notifications = await Notification.find({ user: user._id });
        return NextResponse.json(notifications);
    } catch (error) {
        console.log("ERROR FETCHING NOTIFICATIONS", error);
        return NextResponse.json({ error: "Something went wrong", status: 500 });
    }
}
