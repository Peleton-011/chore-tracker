
export interface Task {
    _id: string;
    title: string;
    description?: string;
    date: Date;
    isCompleted: boolean;
    isImportant: boolean;
    user: string; // Reference to the User model
    household?: string; // Reference to the Household model
    recurringTaskDefinition?: string; // Reference to the RecurringTaskDefinition model
    isPlaceholder: boolean;
    reminders: Reminder[];
    createdAt: Date; // Timestamps fields
    updatedAt: Date;
  }
  
  export interface Reminder {
    type: "before" | "after";
    offsetMinutes: number;
    notified: boolean;
  }

export interface Household {
	_id: string;
	name: string;
	members: string[];
	description?: string;
	tasks: any[];
	recurringTasks: any[];
}

export interface TaskList {
	title: string;
	tasks: any[];
}
