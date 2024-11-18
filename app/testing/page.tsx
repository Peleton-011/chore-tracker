"use client";
import React, { useState } from "react";
import AutonomousModal from "../components/Modals/AutonomousModal";
import ImagePicker from "../components/ImagePicker/ImagePicker";

import HouseIcon from "@/public/icons/HouseIcon";
import SchoolIcon from "@/public/icons/SchoolIcon";
import OfficeIcon from "@/public/icons/OfficeIcon";

const ExamplePage: React.FC = () => {
	const [isImagePickerOpen, setImagePickerOpen] = useState(false);


	const icons = [<HouseIcon />, <SchoolIcon />, <OfficeIcon />];

	const [selectedIconIndex, setSelectedIconIndex] = useState<number | null>(
		null
	);
	const [mainColor, setMainColor] = useState<string>("#D9A8F1"); // Default main color
	const [backgroundColor, setBackgroundColor] = useState<string>("#9236A4"); // Default background color

	return (
		<div>
			<h1>Testing Page</h1>

			<h3>Choose an icon</h3>
			<button
				style={{ backgroundColor }}
				onClick={() => setImagePickerOpen(true)}
			>
				{React.cloneElement(icons[0] as React.ReactElement, {
					color: mainColor,
				})}
			</button>



			{/* Image Picker Modal */}
			<AutonomousModal
				isOpen={isImagePickerOpen}
				onClose={() => setImagePickerOpen(false)}
			>
				<ImagePicker
					icons={icons}
					selectedIconIndex={selectedIconIndex}
					setSelectedIconIndex={setSelectedIconIndex}
					mainColor={mainColor}
					setMainColor={setMainColor}
					backgroundColor={backgroundColor}
					setBackgroundColor={setBackgroundColor}
				/>
				<button onClick={() => setImagePickerOpen(false)}>
					Apply changes
				</button>
			</AutonomousModal>


			
		</div>
	);
};

export default ExamplePage;
