import { User } from "@/models/types";
import React, { useState, useEffect } from "react";

interface UserSelectorProps {
	users: User[]; // List of users
	selectedUserIds: string[]; // Currently selected user IDs
    handleSubmit: (data: { [key: string]: any }) => void
}

const UserSelector: React.FC<UserSelectorProps> = ({
	users,
	selectedUserIds: initialSelectedUserIds,
	handleSubmit,
}) => {
	// Local state to manage the updated user selection
	const [selectedUserIds, setSelectedUserIds] =
		useState<string[]>(initialSelectedUserIds);

	const handleUserClick = (user: User) => {
		setSelectedUserIds((prevSelected) => {
			const isSelected = prevSelected.includes(user._id);

			// Toggle user selection
			const updatedSelection = isSelected
				? prevSelected.filter((id) => id !== user._id)
				: [...prevSelected, user._id];

			return updatedSelection;
		});
	};

	return (
		<div className="user-selector">
			<h2>Select Users</h2>
			<div className="user-list">
				{users.map((user) => (
					<div
						key={user._id}
						className={`user-card ${
							selectedUserIds.includes(user._id)
								? "selected"
								: ""
						}`}
						onClick={() => handleUserClick(user)}
					>
						<img
							src={user.avatar}
							alt={`${user.name}'s avatar`}
							className="avatar"
						/>
						<p>{user.name}</p>
					</div>
				))}
				<button onClick={(e) => handleSubmit({ selectedUserIds })}>
					Apply changes
				</button>
			</div>

			<style jsx>{`
				.user-selector {
					margin: 1rem 0;
				}
				.user-list {
					display: flex;
					overflow-x: auto;
					gap: 1rem;
					padding: 0.5rem 0;
					scrollbar-width: thin;
					scrollbar-color: #9236a4 transparent;
				}
				.user-list::-webkit-scrollbar {
					height: 8px;
				}
				.user-list::-webkit-scrollbar-thumb {
					background-color: #9236a4;
					border-radius: 4px;
				}
				.user-card {
					display: flex;
					flex-direction: column;
					align-items: center;
					cursor: pointer;
					padding: 0.5rem;
					border: 2px solid transparent;
					border-radius: 8px;
					transition: transform 0.2s ease, border-color 0.2s ease;
				}
				.user-card:hover {
					transform: translateY(-5px);
				}
				.user-card.selected {
					border-color: #9236a4; /* Apply outline when selected */
				}
				.avatar {
					width: 50px;
					height: 50px;
					border-radius: 50%;
					object-fit: cover;
					margin-bottom: 0.5rem;
				}
				p {
					margin: 0;
					font-size: 0.9rem;
					text-align: center;
					color: #333;
				}
			`}</style>
		</div>
	);
};

export default UserSelector;
