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
							className={`nav-item ${
								pathname === link ? "active" : ""
							}`}
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

	display: flex;
	flex-direction: column;
	justify-content: space-between;

	color: ${({ theme }) => theme.colorGray3};

	.profile {
		position: relative;
		margin: 1.5rem;
		padding: 1rem 0.8rem;

		border-radius: 1rem;
		cursor: pointer;

		font-weight: 500;
		color: ${({ theme }) => theme.colorGray0};

		display: flex;
		align-items: center;

		.profile-overlay {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			backdrop-filter: blur(10px);
			z-index: 0;
			background-color: ${({ theme }) => theme.colorBg3};
			transition: all 0.55s linear;

			border-radius: 1rem;
			border: 2px solid ${({ theme }) => theme.borderColor2};

			opacity: 0.2;
		}

		h1 {
			font-size: 1.2rem;
			display: flex;
			flex-direction: column;

			line-height: 1.5;
		}

		.image-wrapper,
		h1 {
			position: relative;
			z-index: 1;
		}

		.image-wrapper {
			flex-shrink: 0;
			display: inline-block;
			overflow: hidden;
			transition: all 0.55s ease;
			border-radius: 100%;

			width: 70px;
			height: 70px;

			img {
				width: 100%;
				height: 100%;
				border-radius: 100%;

				transition: all 0.55s ease;
			}
		}

		h1 {
			margin-left: 0.8rem;
			font-size: clamp(1.2rem, 4vw, 1.4rem);
			line-height: 100%;
		}
	}
`;

export default Sidebar;
