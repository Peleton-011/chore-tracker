import cron from "node-cron";
import { Task } from "@/models/index";
import { notifyUser } from "@/app/utils/notifyUser";

export const processReminders = async () => {
    const now = new Date();

    // Find tasks with pending reminders
    const tasks = await Task.find({
        isCompleted: false,
        reminders: {
            $elemMatch: {
                notified: false,
            },
        },
    });

    for (const task of tasks) {
        // Iterate over reminders for this task
        for (const reminder of task.reminders) {
            const taskDate = new Date(task.date); // Ensure `task.date` is a valid Date object

            if (!taskDate || !reminder.offsetMinutes) continue; // Skip if invalid

            const minutesUntilDue = (taskDate.getTime() - now.getTime()) / (1000 * 60); // Time difference in minutes

            // Check if the reminder is due
            const isReminderDue =
                (reminder.type === "before" && minutesUntilDue <= reminder.offsetMinutes) ||
                (reminder.type === "after" && minutesUntilDue >= -reminder.offsetMinutes);

            if (isReminderDue && !reminder.notified) {
                await notifyUser(task.user, "Task Reminder", `Reminder: ${task.title}`);
                reminder.notified = true; // Mark the reminder as notified
            }
        }

        // Save the updated task
        await task.save();
    }
};

// Schedule the job to run every 5 minutes
cron.schedule("*/5 * * * *", processReminders);
