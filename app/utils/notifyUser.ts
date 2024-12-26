import { Notification } from "@/models/index";

export const notifyUser = async (
	userId: string,
	title: string,
	message: string
) => {
	// Create an in-app notification
	const notification = new Notification({ user: userId, title, message });
	await notification.save();

	// Optionally send email or push notifications here
	console.log(`Notified user ${userId}: ${title}`);
};
