import { NextApiRequest, NextApiResponse } from "next";
import mongooseConnection from "@/app/utils/connect";
import { Invite, Household, User } from "@/models/index";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await mongooseConnection();

	const { token } = req.query;

	if (req.method === "GET") {
		try {
			const invite = await Invite.findOne({ token });
			if (!invite) {
				return res.status(404).json({ error: "Invalid invite token" });
			}

			if (invite.expiresAt < new Date()) {
				return res
					.status(400)
					.json({ error: "Invite link has expired" });
			}

			const household = await Household.findById(invite.household);
			if (!household) {
				return res.status(404).json({ error: "Household not found" });
			}

			res.status(200).json({ household, inviteToken: token });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Server error" });
		}
	} else if (req.method === "POST") {
		const { userId } = req.body;

		try {
			const invite = await Invite.findOne({ token });
			if (!invite) {
				return res.status(404).json({ error: "Invalid invite token" });
			}

			if (invite.expiresAt < new Date()) {
				return res
					.status(400)
					.json({ error: "Invite link has expired" });
			}

			const household = await Household.findById(invite.household);
			if (!household) {
				return res.status(404).json({ error: "Household not found" });
			}

			if (!household.members.includes(userId)) {
				household.members.push(userId);
				await household.save();
			}

			const user = await User.findById(userId);
			if (!user.households.includes(household._id)) {
				user.households.push(household._id);
				await user.save();
			}

			res.status(200).json({ message: "User added to household" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Server error" });
		}
	} else {
		res.status(405).json({ error: "Method not allowed" });
	}
}
