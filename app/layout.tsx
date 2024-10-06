import type { Metadata } from "next";
import "../styles/globals.scss";
import ContextProvider from "./providers/ContextProvider";
import { ClerkProvider, auth } from "@clerk/nextjs";
import App from "./App";

export const metadata: Metadata = {
	title: "HouseHold Hero",
	description: "Get your chores together!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { userId } = auth();

	return (
		<ClerkProvider>
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
						{userId && <App userId={userId} children={children} />}
					</ContextProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
