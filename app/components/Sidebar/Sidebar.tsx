"use client";
import React from "react";
import { useGlobalState } from "../../context/globalProvider";
import menu from "../../utils/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function Sidebar() {
	const { collapsed, collapseMenu } = useGlobalState();

	const router = useRouter();
	const pathname = usePathname();

	const handleClick = (link: string) => {
		router.push(link);
	};

	return (
		<nav className="sidebar">
			<ul>
				<li>
					<Link href={menu[0].link}>
						<h1>HouseHold Hero</h1>
					</Link>
				</li>
			</ul>
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
							{item.icon}
							<Link href={link}>{item.title}</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export default Sidebar;
