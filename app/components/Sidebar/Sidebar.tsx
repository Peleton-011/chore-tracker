"use client";
import React from "react";
import { useGlobalState } from "../../context/globalProvider";
import Image from "next/image";
import menu from "../../utils/menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { arrowLeft, bars, logout } from "@/app/utils/Icons";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import Button from "../Button/Button";

function Sidebar() {
	const { collapsed, collapseMenu } = useGlobalState();

	const { signOut } = useClerk();

	const { user } = useUser();

	const { firstName, lastName, imageUrl } = user || {
		firstName: "Ipi",
		lastName: "Bola",
		imageUrl: "/../../public/avatar.png",
	};

	const router = useRouter();
	const pathname = usePathname();

	const handleClick = (link: string) => {
		router.push(link);
	};

	return (
		<nav className={"sidebar" + (collapsed ? " collapsed" : "")}>
			<button className="toggle-nav" onClick={collapseMenu}>
				{collapsed ? bars : arrowLeft}
			</button>
			<div className="profile">
				<div className="profile-overlay"></div>
				<div className="image">
					<Image
						width={70}
						height={70}
						src={imageUrl}
						alt="profile"
					/>
				</div>
				<div className="user-btn">
					<UserButton />
				</div>
				<h1 className="capitalize">
					{firstName} {lastName}
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

			<Button
				name={"Sign Out"}
				type={"submit"}
				padding={"0.4rem 0.8rem"}
				borderRad={"0.8rem"}
				fw={"500"}
				fs={"1.2rem"}
				icon={logout}
				click={() => {
					signOut(() => router.push("/signin"));
				}}
			/>
		</nav>
	);
}

export default Sidebar;
