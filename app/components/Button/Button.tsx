"use client";
import { useGlobalState } from "@/app/context/globalProvider";

import React from "react";

interface Props {
	icon?: React.ReactNode;
	name?: string;
	background?: string;
	padding?: string;
	borderRad?: string;
	fw?: string;
	fs?: string;
	click?: () => void;
	type?: "submit" | "button" | "reset" | undefined;
	border?: string;
	color?: string;
}

function Button({ icon, name, click, type, border, color }: Props) {
	return (
		<button
			className="button-module"
			type={type}
			style={{
				border: border || "none",
				color: color, //|| theme.colorGrey0,
			}}
			onClick={click}
		>
			<span>
				{icon && icon}
				{name}
			</span>
		</button>
	);
}

export default Button;
