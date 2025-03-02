"use client";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import useDeviceType from "./hooks/useDeviceType";
import AutonomousModal from "./components/Modals/AutonomousModal";
import CreateTask from "./components/Forms/CreateTask";
import { fetchTasks } from "./utils/tasks";
import { Task } from "@/models/types";
import { useGlobalState } from "./context/globalProvider";

interface props {
	userId: any;
	children: React.ReactNode;
}

function App({ userId, children }: props) {
	const {taskModal, setTaskModal, editingTask, setEditingTask} = useGlobalState();
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
					closeModal={() => {
						setTaskModal(false);
						fetchTasks();
					}}
				></CreateTask>
			</AutonomousModal>
		</div>
	);
}

export default App;
