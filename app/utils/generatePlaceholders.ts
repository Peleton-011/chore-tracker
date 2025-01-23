import axios from "axios";

export default async function generatePlaceholders(
	recurringDefinitionId: string
) {
	const apiClient = axios.create({
		baseURL:
			process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000", // Replace with your base URL
	});
	// Call /api/tasks/generatePlaceholders
	//

	// curl -X POST http://localhost:3000/api/tasks/placeholders -H "Content-Type: application/json" -d '{"recurringDefinitionId":"67914f15976cc9654a0d35c5"}'

	if (!recurringDefinitionId)
		try {
			await axios.post(
				`http://localhost:3000/api/tasks/placeholders/${recurringDefinitionId}`
			);
		} catch (err) {
			console.error("Failed to generate placeholders:", err);
		}
	console.log(
		"Current hour and minute: ",
		new Date().getHours(),
		":",
		new Date().getMinutes()
	);
}
