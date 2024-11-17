import React from "react";

const UserList = ({ users }: { users: any[] }) => {
  // Its a horizontal scrollable slider showing the profilePic of each user
  return (
    <div className="user-list-container">
      {users.map((user: { userId: string; profilePic: string; username: string }) => (
        <div key={user.userId} className="user-card">
          <img src={user.profilePic} alt={user.username} className="profile-pic" />
          <span className="username">{user.username}</span>
        </div>
      ))}
      <style jsx>{`
        .user-list-container {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          padding: 10px;
          gap: 10px;
        }

        .user-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 0 5px;
        }

        .profile-pic {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .username {
          font-size: 14px;
          margin-top: 5px;
        }

        /* Add scrollbar styling for better UX */
        .user-list-container::-webkit-scrollbar {
          height: 8px;
        }

        .user-list-container::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }

        .user-list-container::-webkit-scrollbar-thumb:hover {
          background-color: #aaa;
        }
      `}</style>
    </div>
  );
};

export default UserList;
