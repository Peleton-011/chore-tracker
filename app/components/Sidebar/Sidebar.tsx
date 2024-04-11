"use client";
import React from "react";
import styled from "styled-components";
import { useGlobalState } from "../../context/globalProvider";
import Image from "next/image";
import menu from "../../utils/menu";
import Link from "next/link";

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
			<ul className="nav-items">
				{menu.map((item) => {
					return (
						<li key={item.id}>
							{item.icon}
							<Link href={item.link}>{item.title}</Link>
						</li>
					);
				})}
			</ul>
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
