import React, { useState } from "react";
import { share } from "@/app/utils/Icons";

const CopyShareButton = ({
	generateContent,
	buttonText,
	buttonActivatedText,
}: {
	//async function generating the content
	generateContent: () => Promise<string>;
	buttonText: string;
	buttonActivatedText?: string;
}) => {
	const [isActivated, setIsActivated] = useState(false);
	return (
		<div>
			<button
				className={isActivated ? " secondary" : ""}
				onClick={() => {
					const content = generateContent().then((content) => {
						navigator.clipboard.writeText(content);
						setIsActivated(true);
					});
				}}
			>
				{buttonActivatedText
					? isActivated
						? buttonActivatedText
						: buttonText
					: buttonText}
			</button>
			{typeof navigator.share === "function" && (
				<button
					className={isActivated ? " secondary" : ""}
                    onClick={() => {
                        const content = generateContent().then((content) => {
                            navigator.clipboard.writeText(content);
                            setIsActivated(true);
                        });
                    }}
				>
					{share}
				</button>
			)}
		</div>
	);
};

export default CopyShareButton;
