import React from "react";

interface IconProps {
	color?: string;
	size?: number;
}

const OfficeIcon: React.FC<IconProps> = ({ color = "#E0E0E0", size = 48 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<mask id="officeMask">
			<rect x="6" y="4" width="12" height="16" rx="1.5" fill="white" />
			<rect x="8" y="6" width="2" height="2" fill="black" />
			<rect x="14" y="6" width="2" height="2" fill="black" />
			<rect x="8" y="10" width="2" height="2" fill="black" />
			<rect x="14" y="10" width="2" height="2" fill="black" />
			<rect x="8" y="14" width="2" height="2" fill="black" />
			<rect x="14" y="14" width="2" height="2" fill="black" />
			<rect x="11" y="16" width="2" height="4" fill="black" />
		</mask>
		<rect
			x="6"
			y="4"
			width="12"
			height="16"
			rx="1.5"
			fill={color}
			mask="url(#officeMask)"
		/>
	</svg>
);

export default OfficeIcon;
