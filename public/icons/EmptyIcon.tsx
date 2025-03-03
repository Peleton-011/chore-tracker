import React from "react";

interface IconProps {
    size?: number;
}

const EmptyIcon: React.FC<IconProps> = ({ size = 48 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        
    </svg>
);

export default EmptyIcon;
