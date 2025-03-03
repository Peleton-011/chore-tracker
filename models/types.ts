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
}

export const DEFAULT_TASK: Task = {
	_id: "",
	title: "",
	// description: "",
	date: new Date(),
	isCompleted: false,
	isImportant: false,
	user: "",
	// household: "",
	// recurringTaskDefinition: "",
	isPlaceholder: false,
	reminders: [],
};

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

export interface User {
	_id: string;
    households: string[];
	// add other properties as needed
}

export interface TaskTrade {
	_id: string;
	taskId: string;
	fromUserId: string;
	toUserId: string;
	isAccepted?: boolean;
	// add other properties as needed
}

export interface FilteredTasks {
	overdue: Task[];
	today: Task[];
	laterThisWeek: Task[];
	laterThisMonth: Task[];
	someday: Task[];
}
