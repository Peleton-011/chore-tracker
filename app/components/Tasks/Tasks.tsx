"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React from "react";
import styled from "styled-components";

function Tasks() {
	const { theme } = useGlobalState();
	return (
		<TaskStyled theme={theme}>
			<div>Tasks</div>
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
