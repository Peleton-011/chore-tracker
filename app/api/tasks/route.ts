import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {userId} = auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized",status: 401 });
        }

        const {title, description, date, completed, important} = await req.json();
    } catch (error) {
        console.log("ERROR CREATING TASK", error);
        return NextResponse.json({ error: "Something went wrong",status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        return new Response("Hello, Next.js!");
    } catch (error) {
        console.log("ERROR GETTING TASK", error);
        return NextResponse.json({ error: "Something went wrong",status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        return new Response("Hello, Next.js!");
    } catch (error) {
        console.log("ERROR UPDATING TASK", error);
        return NextResponse.json({ error: "Something went wrong",status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        return new Response("Hello, Next.js!");
    } catch (error) {
        console.log("ERROR DELETING TASK", error);
        return NextResponse.json({ error: "Something went wrong",status: 500 });
    }
}