import React from "react";

interface IconProps {
	color?: string;
	size?: number;
}

const HouseIcon: React.FC<IconProps> = ({ color = "#E0E0E0", size = 48 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<mask id="houseMask">
			<rect x="6" y="12" width="12" height="8" rx="1.5" fill="white" />
			<rect x="11" y="14" width="2" height="4" fill="black" />
		</mask>
		<path
			d="M3 12L12 4L21 12"
			stroke={color}
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<rect
			x="6"
			y="12"
			width="12"
			height="8"
			rx="1.5"
			fill={color}
			mask="url(#houseMask)"
		/>
	</svg>
);

export default HouseIcon;
