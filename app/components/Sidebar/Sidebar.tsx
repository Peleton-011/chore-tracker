"use client";
import React from "react";
import styled from "styled-components";
import { useGlobalState } from "../../context/globalProvider";
import Image from "next/image";

function Sidebar() {
	const { theme } = useGlobalState();

	return (
		<SidebarStyled theme={theme}>
			<div className="profile">
				<div className="profile-overlay"></div>
				<div className="image-wrapper">
					<Image
						src="/avatar.jpeg"
						alt="profile picture"
						width={70}
						height={70}
					/>
				</div>
				<h1>
					<span>Ipi</span>
					<span>Bola</span>
				</h1>
			</div>
		</SidebarStyled>
	);
}

const SidebarStyled = styled.nav`
	position: relative;
	width: ${({ theme }) => theme.sidebarWidth};
	background-color: ${({ theme }) => theme.colorBg2};
	border: 2px solid ${({ theme }) => theme.borderColor2};

	border-radius: 1rem;
`;

export default Sidebar;
