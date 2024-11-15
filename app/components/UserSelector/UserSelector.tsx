import React, { useState } from "react";

interface User {
	_id: string;
	name: string;
	avatar: string; // URL or path to the avatar image
}

interface UserSelectorProps {
	users: User[]; // List of users
	onUserSelect?: (selectedUsers: User[]) => void; // Callback when users are selected
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, onUserSelect }) => {
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const handleUserClick = (user: User) => {
		setSelectedUserIds((prevSelected) => {
			const isSelected = prevSelected.includes(user._id);

			// Toggle user selection
			const updatedSelection = isSelected
				? prevSelected.filter((id) => id !== user._id)
				: [...prevSelected, user._id];

			// Trigger callback with updated selection
			if (onUserSelect) {
				const selectedUsers = users.filter((u) =>
					updatedSelection.includes(u._id)
				);
				onUserSelect(selectedUsers);
			}

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
							selectedUserIds.includes(user._id) ? "selected" : ""
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
					border-color: #9236a4;
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
