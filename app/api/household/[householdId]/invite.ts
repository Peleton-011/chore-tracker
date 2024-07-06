import crypto from "crypto";
import mongooseConnection from "@/app/utils/connect";
import { Invite, Household } from "@/models/index";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await mongooseConnection();

	const { householdId } = req.query;

	if (req.method === "POST") {
		try {
			const household = await Household.findById(householdId);
			if (!household) {
				return res.status(404).json({ error: "Household not found" });
			}

			const token = crypto.randomBytes(20).toString("hex");
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7);

			const invite = new Invite({
				token,
				household: household._id,
				expiresAt,
			});
			await invite.save();

			const inviteLink = `${req.headers.origin}/invite/${token}`;

			res.status(201).json({ inviteLink });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Server error" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
