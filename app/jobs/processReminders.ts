import cron from "node-cron";
import { processReminders } from "@/app/utils/processReminders";

// Schedule the job to run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
    console.log("Running reminder job...");
    await processReminders();
});
