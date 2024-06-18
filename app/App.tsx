"use client";
import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import useDeviceType from "./hooks/useDeviceType";

interface props {
	userId: any;
	children: React.ReactNode;
}

function App({ userId, children }: props) {
	const isMobile = useDeviceType();

	return (
		<>
			{userId && !isMobile && <Sidebar isMobile={isMobile} />}
			<main>
				<div className="container-fluid">{children}</div>
			</main>
			{userId && isMobile && <Sidebar isMobile={isMobile} />}
		</>
	);
}

export default App;
