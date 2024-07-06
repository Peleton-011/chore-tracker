import { NextApiRequest, NextApiResponse } from "next";
import mongooseConnection from "@/app/utils/connect";
import { Household, User } from "@/models/index";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	await mongooseConnection();

	const { method } = req;

	switch (method) {
		case "GET":
			try {
				const userId = req.query.userId as string;
				const user = await User.findById(userId).populate("households");
				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				res.status(200).json({ households: user.households });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: "Server error" });
			}
			break;

		case "POST":
			try {
				const { userId, name } = req.body;
				const user = await User.findById(userId);
				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				const newHousehold = new Household({
					name,
					members: [user._id],
				});
				await newHousehold.save();

				user.households.push(newHousehold._id);
				await user.save();

				res.status(201).json({ household: newHousehold });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: "Server error" });
			}
			break;

		default:
			res.status(405).json({ error: "Method not allowed" });
			break;
	}
}
