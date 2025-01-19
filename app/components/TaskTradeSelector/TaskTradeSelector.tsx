"use client";
import React, { useEffect, useState } from "react";
import AutonomousModal from "../Modals/AutonomousModal";
import Calendar from "react-calendar";
import { useGlobalState } from "@/app/context/globalProvider";
import formatDate from "@/app/utils/formatDate";
import axios from "axios";
import Button from "../Button/Button";
import { Value } from "react-calendar/src/shared/types.js";

interface Task {
	_id: string;
	title: string;
	date: Date;
	description: string;
	isCompleted: boolean;
	isImportant: boolean;
	isRecurring: boolean;
	intervalValue: number;
	intervalUnit: string;
	recurrenceEndDate: Date;
}
interface TaskTradeSelectorProps {
	householdId: string;
	onSelect: (taskId: string) => void;
}

const TaskTradeSelector = ({
	householdId,
	onSelect,
}: TaskTradeSelectorProps) => {
	const { closeModal } = useGlobalState();
	const [tasks, setTasks] = useState<Task[]>([]); // Initialize tasks as an empty array
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [date, setDate] = useState<Value | null>(new Date());
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		async function fetchTasks() {
			try {
				const response = await axios.get(
					`/api/households/${householdId}/tasks`
				);
				const allTasks = response.data;

				// Include future occurrences of recurring tasks
				const recurringTasks = allTasks.filter(
					(task: Task) => task.isRecurring
				);
				const futureTasks = recurringTasks.flatMap((task: Task) =>
					generateFutureOccurrences(task)
				);

				setTasks([...allTasks, ...futureTasks]);
			} catch (error) {
				console.error("Error fetching tasks:", error);
			}
		}
		fetchTasks();
	}, [householdId]);

	function generateFutureOccurrences(task: Task) {
		const occurrences = [];
		let nextDate = new Date(task.date);
		while (nextDate <= new Date(task.recurrenceEndDate)) {
			nextDate = new Date(nextDate);
			if (task.intervalUnit === "days") {
				nextDate.setDate(nextDate.getDate() + task.intervalValue);
			} else if (task.intervalUnit === "weeks") {
				nextDate.setDate(nextDate.getDate() + task.intervalValue * 7);
			} else if (task.intervalUnit === "months") {
				nextDate.setMonth(nextDate.getMonth() + task.intervalValue);
			} else if (task.intervalUnit === "years") {
				nextDate.setFullYear(
					nextDate.getFullYear() + task.intervalValue
				);
			}
			occurrences.push({ ...task, date: nextDate });
		}
		return occurrences;
	}

	const filteredTasks = tasks.filter(
		(task) => formatDate(task.date) === formatDate(date)
	);

	return (
		<>
			<button className="outline" onClick={() => setIsOpen(true)}>
				Select Task for Trade
			</button>
			<AutonomousModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<h2>Select a Task to Trade</h2>
				<Calendar
					value={date}
					onChange={setDate}
					next2Label={null}
					prev2Label={null}
				/>
				<ul>
					{filteredTasks.map((task) => (
						<li
							key={task._id}
							onClick={() => setSelectedTask(task)}
						>
							{task.title} ({formatDate(task.date)})
						</li>
					))}
				</ul>
				{selectedTask && (
					<div>
						<p>
							Selected Task: {selectedTask.title} (
							{formatDate(selectedTask.date)})
						</p>
						<Button
							name="Confirm Trade"
							click={() => {
								onSelect(selectedTask._id);
								setIsOpen(false);
								closeModal();
							}}
						/>
					</div>
				)}
			</AutonomousModal>
		</>
	);
};

export default TaskTradeSelector;
