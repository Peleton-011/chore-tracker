"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React from "react";
import styled from "styled-components";
import CreateContent from "../Modals/CreateContent";

import TaskItem from "../TaskItem/TaskItem";

interface Props {
    title: string;
    tasks: any[];
}


function Tasks({ title, tasks }: Props) {
	const { theme } = useGlobalState();
    // console.log("TASKS: ", tasks)
	return (
		<TaskStyled theme={theme}>
			<CreateContent />

            {tasks.map((task: any) => (
                <TaskItem key={task.id} {...task} />
            ))}
		</TaskStyled>
	);
}

const TaskStyled = styled.main`
    padding: 2rem;
	width: 100%;
    height: 100%;
	background-color: ${({theme}) => theme.colorBg2};
	border: 2px solid ${({ theme }) => theme.borderColor2};
	border-radius: 1rem;

	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 0.5rem;
	}
`;

export default Tasks;
