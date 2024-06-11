"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import { edit, trash, exclamation } from "@/app/utils/Icons";
import React from "react";
import styled from "styled-components";
import formatDate from "@/app/utils/formatDate";

interface Props {
	title: string;
	description: string;
	date: string;
	isCompleted: boolean;
	isImportant: boolean;
	id: string;
	editTask: ({
		id,
		isCompleted,
		isImportant,
		title,
		description,
		date,
	}: {
		id: string;
		isCompleted: boolean;
		isImportant: boolean;
		title: string;
		description: string;
		date: string;
	}) => void;
}

function TaskItem({
	title,
	description,
	date,
	isCompleted,
	isImportant,
	id,
	editTask,
}: Props) {
	const { theme, deleteTask, updateTask } = useGlobalState();
	return (
		<TaskItemStyled theme={theme}>
			<h1>
				<span>{title}</span> <span>{isImportant ? exclamation : ""}</span>
			</h1>
			<p>{description}</p>
			<p className="date">{formatDate(date)}</p>
			<div className="task-footer">
				<button
					className={isCompleted ? "completed" : "incomplete"}
					onClick={() => {
						const task = {
							id,
							isCompleted: !isCompleted,
						};

						updateTask(task);
					}}
				>
					{isCompleted ? "Completed" : "Incomplete"}
				</button>
				<button
					className="edit"
					onClick={() =>
						editTask({
							id,
							isCompleted,
                            isImportant,
							title,
							description,
							date,
						})
					}
				>
					{edit}
				</button>
				<button
					className="delete"
					onClick={() => {
						console.log(id);
						deleteTask(id);
					}}
				>
					{trash}
				</button>
			</div>
		</TaskItemStyled>
	);
}

const TaskItemStyled = styled.div`
	padding: 1.2rem 1rem;
	border-radius: 1rem;
	background-color: ${({ theme }) => theme.borderColor2};
	box-shadow: ${({ theme }) => theme.shadow7};
	border: 2px solid ${({ theme }) => theme.borderColor2};

	height: 16rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

	.date {
		margin-top: auto;
	}

	> h1 {
		font-size: 1.5rem;
		font-weight: 600;
        display: flex;
        justify-content: space-between;
        padding-right: 1rem;

        span:last-child {
            font-size: 2rem;
            line-height: 1rem;
        }
	}

	.task-footer {
		display: flex;
		align-items: center;
		gap: 1.2rem;

		button {
			border: none;
			outline: none;
			cursor: pointer;

			i {
				font-size: 1.4rem;
				color: ${(props) => props.theme.colorGrey2};
			}
		}

		.edit {
			margin-left: auto;
		}

		.completed,
		.incomplete {
			display: inline-block;
			padding: 0.4rem 1rem;
			background: ${(props) => props.theme.colorDanger};
			border-radius: 30px;
		}

		.completed {
			background: ${(props) => props.theme.colorGreenDark} !important;
		}
	}
`;

export default TaskItem;
