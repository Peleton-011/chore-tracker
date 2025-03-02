"use client";
import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import useDeviceType from "./hooks/useDeviceType";
import Modal from "./components/Modals/Modal";
import CreateContent from "./components/Modals/CreateContent";
import { useGlobalState } from "@/app/context/globalProvider";

interface props {
	userId: any;
	children: React.ReactNode;
}

function App({ userId, children }: props) {
	const isMobile = useDeviceType();

	return (
		<div className="app-container">

			{userId && !isMobile && <Sidebar isMobile={isMobile} />}
			<main>{children}</main>
			{userId && isMobile ? (
				<Sidebar isMobile={isMobile} />
			) : (
				<footer>
					<span>
						Check out our{" "}
						<a
							href="https://github.com/Peleton-011/chore-tracker"
							target="_blank"
						>
							GitHub repository <i className="fab fa-github"></i>
						</a>
					</span>
				</footer>
			)}
		</div>
	);
}

export default App;
