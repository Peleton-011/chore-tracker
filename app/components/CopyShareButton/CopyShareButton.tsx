import React, { useState } from "react";
import { share } from "@/app/utils/Icons";

const CopyShareButton = ({
	content,
	buttonText,
	buttonActivatedText,
}: {
	content: any;
	buttonText: string;
	buttonActivatedText?: string;
}) => {
	const [isActivated, setIsActivated] = useState(false);
	return (
		<div>
			<button
				className={isActivated ? " secondary" : ""}
				onClick={() => {
					navigator.clipboard.writeText(content);
					setIsActivated(true);
				}}
			>
				{buttonActivatedText
					? isActivated
						? buttonActivatedText
						: buttonText
					: buttonText}
			</button>
			{navigator.share && (
				<button
					className={isActivated ? " secondary" : ""}
					onClick={() => {
						navigator.share(content);
						setIsActivated(true);
					}}
				>
					{share}
				</button>
			)}
		</div>
	);
};

export default CopyShareButton;
