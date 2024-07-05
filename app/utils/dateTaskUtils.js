import {
	isToday,
	isAfter,
	isBefore,
	startOfWeek,
    startOfMonth,
	endOfWeek,
	endOfMonth,
	startOfToday,
	startOfDay,
} from "date-fns";

export default {
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
		const today = startOfToday();
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
};
