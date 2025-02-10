# Household Hero

## Overview
Household Hero is an advanced task management platform designed for households and individuals. It provides an efficient and intuitive way to manage chores, assign tasks, and streamline household coordination. Built with speed, maintainability, and an emphasis on user experience, Household Hero ensures that managing daily responsibilities becomes effortless.

## Features
- **Task Management**: Create, assign, and track household tasks effortlessly.
- **Task Trading (Upcoming)**: Exchange tasks among household members to distribute responsibilities effectively.
- **Intuitive UI**: A sleek, modern, and responsive design for a seamless user experience.
- **Multi-Device Support**: Optimized for desktops, tablets, and mobile devices.
- **Reminders & Notifications**: Get notified about upcoming tasks and changes.
- **Calendar Integration**: View and manage tasks with an interactive calendar.
- **Secure Authentication**: Built-in authentication and user management for household members.
- **Fast & Maintainable Code**: Developed using modern frameworks with an emphasis on speed and efficiency.

## Tech Stack
- **Frontend**: Next.js (React framework), TypeScript, SCSS
- **Backend**: Node.js, Next.js API routes, MongoDB
- **Database**: MongoDB with Mongoose ORM
- **Styling**: SCSS & Tailwind CSS for a sleek and customizable UI
- **Authentication**: Clerk authentication for secure user management
- **State Management**: React Context API

## Installation & Setup
To run Household Hero locally, follow these steps:

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [MongoDB](https://www.mongodb.com/) (Locally or via cloud services like MongoDB Atlas)

### Clone the Repository
```sh
git clone https://github.com/yourusername/household-hero.git
cd household-hero
```

### Install Dependencies
```sh
npm install
```

### Configure Environment Variables
Create a `.env.local` file in the root directory and set the necessary environment variables:
```sh
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

### Run the Development Server
```sh
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage
### Creating a Household
1. Click "Create Household" in the dashboard.
2. Set a household name, description, and select an icon.
3. Invite members via a generated shareable link.

### Managing Tasks
1. Navigate to a household's task list.
2. Add new tasks with due dates and priority levels.
3. Assign tasks to specific members or leave them open for claiming.
4. Track task progress via status indicators.

### Task Trading (Upcoming)
- Users will soon be able to exchange tasks with other household members, making management more flexible and cooperative.

### Notifications & Reminders
- Users receive real-time notifications for assigned tasks and reminders for upcoming deadlines.

## Contribution
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact
For any inquiries or feedback, reach out to [your contact email or GitHub profile].

