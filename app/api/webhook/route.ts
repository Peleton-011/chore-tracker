import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { User } from "@/models/index";

export async function POST(req: Request) {
	// You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
	const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		throw new Error(
			"Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
		);
	}

	// Get the headers
	const headerPayload = headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Error occured -- no svix headers", {
			status: 400,
		});
	}

	// Get the body
	const payload = await req.json();
	const body = JSON.stringify(payload);

	// Create a new Svix instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error occured", {
			status: 400,
		});
	}

	// Do something with the payload
	// For this guide, you simply log the payload to the console
	const eventType = evt.type;
	// console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
	// console.log("Webhook body:", body);

	console.log(evt.data);

	if (eventType === "user.created") {
		const {
			id,
			email_addresses,
			username,
			first_name,
			last_name,
			image_url,
		} = evt.data;

		// console.log(email_addresses);
		const user = new User({
			userId: id,
			email: email_addresses[0].email_address,
			username: username || first_name + " " + last_name,
			profilePic: image_url || "/avatar.svg",
		});
		await user.save();
		console.log("User saved to database");
	} else if (eventType === "user.deleted") {
		const { id } = evt.data;
		const user = await User.findOne({ userId: id });
		if (user) {
			await user.delete();
			console.log("User deleted from database");
		}
	} else if (eventType === "user.updated") {
		const { id, email_addresses, username, first_name, last_name } =
			evt.data;
		const user = await User.findOne({ userId: id });
		if (user) {
			user.email = email_addresses[0];
			user.username = username || first_name + " " + last_name;
			await user.save();
			console.log("User updated in database");
		}
	}

	return new Response("", { status: 200 });
}

// // pages/api/webhook.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { NextResponse } from "next/server";
// import axios from "axios";

// export async function POST(req: NextApiRequest, res: NextApiResponse) {
// 	const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;
// 	const receivedSecret = req.headers["x-clerk-signature"];

// 	if (!clerkWebhookSecret || receivedSecret !== clerkWebhookSecret) {
// 		return NextResponse.json({
// 			message: "Invalid webhook secret",
// 			status: 401,
// 		});
// 	}

// 	try {
// 		const webhookData = req.body;

// 		// Process the webhook data as needed
// 		console.log("Webhook data received:", webhookData);

// 		// Optionally, you can use Axios to forward the data or make other HTTP requests

// 		return NextResponse.json({
// 			message: "Webhook received successfully",
// 			status: 200,
// 		});
// 	} catch (error) {
// 		console.error("Error processing webhook:", error);
// 		return NextResponse.json({
// 			message: "Internal server error",
// 			status: 500,
// 		});
// 	}
// }
