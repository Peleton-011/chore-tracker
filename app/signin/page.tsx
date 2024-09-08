"use client";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";

function page() {
	return (
		<div className="landing-page">
			<div className="hero">
				<h1 className="title">
					Save Time. Slay <br />
					Chores.
				</h1>
				<p className="subtitle">
					<span className="space">A</span> The world's leading
					chore-tracking platform
				</p>

				<p className="buttons">
					<SignInButton mode="modal">
						<button className="outline">Sign In</button>
					</SignInButton>
					<span className="divide">|</span>
					<SignUpButton mode="modal">
						<button className="outline">Sign Up</button>
					</SignUpButton>
				</p>
			</div>
		</div>
	);
}

export default page;
