import type { Metadata } from "next";
import "../styles/globals.scss";
import ContextProvider from "./providers/ContextProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { dark } from "@clerk/themes";
import App from "./App";
import "./jobs/recurringTasksCron";

export const metadata: Metadata = {
	title: "HouseHold Hero",
	description: "Get your chores together!",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { userId } = await auth();

	return (
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<html lang="en">
				<head>
					<link
						rel="stylesheet"
						href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
						integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
						crossOrigin="anonymous"
						referrerPolicy="no-referrer"
					/>
				</head>
				<body>
					<ContextProvider>
						<App userId={userId} children={children} />
					</ContextProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
