"use client";
import React from "react";
import styled from "styled-components";
import { useGlobalState } from "../../context/globalProvider";

function Sidebar() {
	const { theme } = useGlobalState();

	console.log(theme);
	return <SidebarStyled theme={theme}>Sidebar</SidebarStyled>;
}

const SidebarStyled = styled.nav`
	position: relative;
	width: ${({ theme }) => theme.sidebarWidth};
	background-color: ${({ theme }) => theme.colorBg2};
    border: 2px solid ${({ theme }) => theme.borderColor2};

    border-radius: 1rem;
`;

export default Sidebar;
