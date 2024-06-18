"use client";
import React from "react";
import menu from "../../utils/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface props {
	isMobile: boolean;
}

function Sidebar({ isMobile }: props) {
	const router = useRouter();
	const pathname = usePathname();

	const handleClick = (link: string) => {
		router.push(link);
	};

	return (
		<nav className="sidebar">
			{!isMobile && (
				<ul>
					<li>
						<Link href={menu[0].link}>
							<h1>HouseHold Hero</h1>
						</Link>
					</li>
				</ul>
			)}
			<ul className="nav-items">
				{menu.map((item) => {
					const link = item.link;
					return (
						<li
							key={item.id}
							className={`nav-item ${
								pathname === link ? "active" : ""
							}`}
							onClick={() => {
								handleClick(link);
							}}
						>
							<Link href={link}>
								{item.icon} {!isMobile && item.title}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export default Sidebar;
