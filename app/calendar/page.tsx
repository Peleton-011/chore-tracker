"use client";
import React, { useEffect } from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import Tasks from "../components/Tasks/Tasks";
import { useState } from "react";
import Calendar from "react-calendar";
import "@/styles/calendar.scss";
import dateTaskUtils from "../utils/dateTaskUtils";
import { isTomorrow } from "date-fns";
import formatDate from "../utils/formatDate";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

function page() {
	const { filteredTasks } = useGlobalState();
	const [date, setDate] = useState<Value>(new Date());

	const onChange = (date: Value) => {
		setDate(date);
	};

	const [allTasks, setAllTasks] = useState(
		Object.values(filteredTasks).flat()
	);

	const [tasklist, setTasklist] = useState({
		title: "Today",
		tasks: filteredTasks.today,
	});

	useEffect(() => {
		setAllTasks(Object.values(filteredTasks).flat());
	}, [filteredTasks]);

	useEffect(() => {
		setTasklist({
			title: getListTitle(date),
			tasks: dateTaskUtils.onDay(allTasks, date),
		});
	}, [date]);

	function getListTitle(date: Value | Date) {
		if (date === null) {
			return "Today";
		}
		if (isTomorrow(new Date(date?.toString()))) {
			return "Tomorrow";
		} else {
			return formatDate(date);
		}
	}

	return (
		<div className="app">
			<h1 className="text-center">Calendar</h1>
			<div className="calendar-container">
				<Calendar
					value={date}
					onChange={onChange}
					next2Label={null}
					prev2Label={null}
				/>
			</div>
			<p className="text-center">
				<span className="bold">Selected Date:</span> {formatDate(date)}
			</p>

			<Tasks title="Importent Tasks" lists={[tasklist]} />
		</div>
	);
}

export default page;
