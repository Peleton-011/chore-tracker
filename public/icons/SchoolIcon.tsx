import React from "react";

interface IconProps {
	color?: string;
	size?: number;
}

const SchoolIcon: React.FC<IconProps> = ({ color = "#E0E0E0", size = 48 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<mask id="schoolMask">
			<rect x="5" y="10" width="14" height="10" rx="1.5" fill="white" />
			<rect x="7" y="12" width="2" height="2" fill="black" />
			<rect x="15" y="12" width="2" height="2" fill="black" />
			<rect x="11" y="14" width="2" height="4" fill="black" />
		</mask>
		<path
			d="M3 10L12 4L21 10"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<rect
			x="5"
			y="10"
			width="14"
			height="10"
			rx="1.5"
			fill={color}
			mask="url(#schoolMask)"
		/>
	</svg>
);

export default SchoolIcon;
