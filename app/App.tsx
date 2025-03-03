"use client";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import useDeviceType from "./hooks/useDeviceType";
import AutonomousModal from "./components/Modals/AutonomousModal";
import CreateTask from "./components/Forms/CreateTask";
import { useGlobalState } from "./context/globalProvider";

interface props {
	userId: any;
	children: React.ReactNode;
}

function App({ userId, children }: props) {
	const {
		taskModal,
		setTaskModal,
		editingTask,
		setEditingTask,
		updateTask,
		createTask,
	} = useGlobalState();
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

			<AutonomousModal
				isOpen={taskModal}
				onClose={() => setTaskModal(false)}
			>
				<CreateTask
					task={editingTask || null}
					updateTask={(task) => {
						updateTask(task);
                        setEditingTask(null);
						setTaskModal(false);
					}}
					createTask={(task) => {
						createTask(task);
						setTaskModal(false);
					}}
				></CreateTask>
			</AutonomousModal>
		</div>
	);
}

export default App;
