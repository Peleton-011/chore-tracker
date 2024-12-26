import {
	isToday,
	isAfter,
	isBefore,
	isSameDay,
	startOfWeek,
	startOfMonth,
	endOfWeek,
	endOfMonth,
	startOfToday,
	endOfToday,
	startOfDay,
} from "date-fns";

export default {
	//A function that takes in an array of tasks and a date and returns only those tasks that are due that day
	onDay: (tasks, date) => {
		return tasks.filter((task) => {
			const taskDate = new Date(task.date);
			return isSameDay(taskDate, date);
		});
	},
	overdue: (tasks) => {
		return tasks.filter((task) => {
			const date = new Date(task.date);
			return date < new Date() && !isToday(date);
		});
	},
	isLate: (task) => {
		return new Date(task.date) < new Date();
	},
	today: (tasks) => {
		return tasks.filter((task) => isToday(new Date(task.date)));
	},
	laterThisWeek: (tasks) => {
		const today = endOfToday();
		const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Assuming the week starts on Monday
		const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });

		return tasks.filter(
			({ date }) => isAfter(date, today) && isBefore(date, endOfThisWeek)
		);
	},
	laterThisMonth: (tasks) => {
		const today = startOfToday();
		const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Assuming the week starts on Monday
		const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
		const startOfNextWeek = startOfDay(
			new Date(endOfThisWeek.getTime() + 24 * 60 * 60 * 1000)
		);
		const endOfThisMonth = endOfMonth(today);

		return tasks.filter(
			({ date }) =>
				isAfter(date, endOfThisWeek) && isBefore(date, endOfThisMonth)
		);
	},

	someday: (tasks) => {
		const today = startOfToday();
		const endOfThisMonth = endOfMonth(today);

		return tasks.filter(({ date }) => isAfter(date, endOfThisMonth));
	},

	filterAll: function (tasks) {
		const overdue = this.overdue(tasks);
		const today = this.today(tasks);
		const laterThisWeek = this.laterThisWeek(tasks);
		const laterThisMonth = this.laterThisMonth(tasks);
		const someday = this.someday(tasks);
		return [
			{ title: "overdue", tasks: overdue },
			{ title: "Today", tasks: today },
			{ title: "Later this week", tasks: laterThisWeek },
			{ title: "Later this month", tasks: laterThisMonth },
			{ title: "Someday", tasks: someday },
		];
	},
};
