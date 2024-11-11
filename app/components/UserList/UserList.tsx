import React from "react";

const UserList = ({ users }: { users: any[] }) => {
	//Its a horizontal scrollable slider showing the profilePic of each user
	return (
		<div className="flex overflow-x-scroll overflow-y-hidden">
			{users.map(
				(user: {
					userId: string;
					profilePic: string;
					username: string;
				}) => (
					<div
						key={user.userId}
						className="flex flex-col items-center justify-center"
					>
						<img
							src={user.profilePic}
							alt={user.username}
							className="w-12 h-12 rounded-full"
						/>
						<span className="text-sm">{user.username}</span>
					</div>
				)
			)}
		</div>
	);
};

export default UserList;
