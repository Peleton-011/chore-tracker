import type { Metadata } from "next";
import "../styles/globals.scss";
import Sidebar from "./components/Sidebar/Sidebar";
import ContextProvider from "./providers/ContextProvider";
import { ClerkProvider, auth } from "@clerk/nextjs";

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
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
					<main>
						<ContextProvider>
							<aside>{userId && <Sidebar />}</aside>
							<div className="container-fluid">{children}</div>
						</ContextProvider>
					</main>
					<footer>
						<span>
							Check out our{" "}
							<a
								href="https://github.com/Peleton-011/chore-tracker"
								target="_blank"
							>
								GitHub repository{" "}
								<i className="fab fa-github"></i>
							</a>
						</span>
					</footer>
				</body>
			</html>
		</ClerkProvider>
	);
}
