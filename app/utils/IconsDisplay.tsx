import React from "react";
import * as Icons from "@/app/utils/Icons";


const IconsDisplay = () => {
	return (
		<div>
			{Object.keys(Icons).map((key) => (
				<div key={key}>
					{key}: {Icons[key as keyof typeof Icons]}
				</div>
			))}
		</div>
	);
};

export default IconsDisplay;
