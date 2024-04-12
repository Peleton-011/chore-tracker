"use client";
import React from "react";
import styled from "styled-components";
import { useGlobalState } from "../../context/globalProvider";
import Image from "next/image";
import menu from "../../utils/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function Sidebar() {
	const { theme } = useGlobalState();

	const router = useRouter();
    const pathname = usePathname();

	const handleClick = (link: string) => {
		router.push(link);
	};

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
					<span>Ipi </span> 
					<span>Bola</span>
				</h1>
			</div>
			<ul className="nav-items">
				{menu.map((item) => {

                    const link = item.link;
					return (
						<li
							key={item.id}
							className={`nav-item ${pathname === link ? "active" : ""}`}
							onClick={() => handleClick(item.link)}
						>
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
