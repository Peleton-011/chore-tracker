"use client";
import React from "react";
import styled from "styled-components";
import { useGlobalState } from "../../context/globalProvider";

function Sidebar() {
	const { theme } = useGlobalState();

	console.log(theme);
	return <SidebarStyled>Sidebar</SidebarStyled>;
}

const SidebarStyled = styled.nav`
    background-color: red;
`;

export default Sidebar;
