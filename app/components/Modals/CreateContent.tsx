import React from "react";
import CreateTask from "./Forms/CreateTask";
import CreateHousehold from "./Forms/CreateHousehold";

const CreateContent = ({
	content,
	type,
	isMobile,
}: {
	content: any;
	type: string;
	isMobile: boolean;
}) => {
    console.log(content);
    console.log(type);
	return (
		<>
			{type === "task" ? (
				<CreateTask task={content} isMobile={isMobile} />
			) : type === "household" ? (
				<CreateHousehold household={content} isMobile={isMobile} />
			) : null}
		</>
	);
};

export default CreateContent;
