export interface Household {
	_id: string;
	name: string;
	members: string[];
    description: string;
	tasks: any[];
	recurringTasks: any[];
}