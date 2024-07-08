"use client";
import React from "react";
import menu from "../../utils/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { plus } from "@/app/utils/Icons";
import { useGlobalState } from "@/app/context/globalProvider";
import Profile from "../Profile/Profile";

interface props {
	isMobile: boolean;
}

function Sidebar({ isMobile }: props) {
	const router = useRouter();
	const pathname = usePathname();

	const handleClick = (link: string) => {
		router.push(link);
	};

	const { createTask } = useGlobalState();

	const makeNavbarItems = (items: Array<any>) => {
		return items.map((item) => {
			const link = item.link;
			return (
				<li
					key={item.id}
					className={`nav-item ${pathname === link ? "active" : ""}`}
					onClick={() => {
						handleClick(link);
					}}
				>
					<Link href={link}>
						{item.icon}
						{!isMobile && item.title}
					</Link>
				</li>
			);
		});
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
				{makeNavbarItems(menu.slice(0, 2))}
				{isMobile && (
					<li className="nav-new-task">
						<button className="nav-add-button" onClick={createTask}>
							{plus}
						</button>
					</li>
				)}
				{makeNavbarItems(menu.slice(2))}

				{!isMobile && (
						<li className="nav-item">
							<Link href="/about">About</Link>
						</li>
					) && (
						<li className="nav-new-task">
							<button
								className="nav-add-button"
								onClick={createTask}
							>
								{plus}
							</button>
						</li>
					)}

                    <li>
                        <Profile />
                    </li>
			</ul>
		</nav>
	);
}

export default Sidebar;
