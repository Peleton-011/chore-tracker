"use client";
import React from "react";
import { useGlobalState } from "@/app/context/globalProvider";
import Tasks from "../components/Tasks/Tasks";
import { useState } from "react";
import Calendar from "react-calendar";
import "@/styles/calendar.scss";


type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

function page() {
	const { importantTasks } = useGlobalState();
	const [date, setDate] = useState<Value>(new Date());

	const onChange = (date: Date | Date[]) => {
		setDate(date);
	};

	return (
		<div className="app">
			<h1 className="text-center">Calendar</h1>
			<div className="calendar-container">
				<Calendar value={date} onChange={onChange} next2Label={null} prev2Label={null} />
			</div>
			<p className="text-center">
				<span className="bold">Selected Date:</span>{" "}
				{date.toDateString()}
			</p>
			{false && <Tasks title="Importent Tasks" tasks={importantTasks} />}
		</div>
	);
}

export default page;
