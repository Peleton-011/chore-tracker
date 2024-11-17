"use client";
import React, { useState } from "react";
import AutonomousModal from "../components/Modals/AutonomousModal";
import ImagePicker from "../components/ImagePicker/ImagePicker";
import UserSelector from "../components/UserSelector/UserSelector";
import DateTimeSelector from "../components/DateTimeSelector/DateTimeSelector";

import HouseIcon from "@/public/icons/HouseIcon";
import SchoolIcon from "@/public/icons/SchoolIcon";
import OfficeIcon from "@/public/icons/OfficeIcon";
import { addHours, startOfToday } from "date-fns";

const ExamplePage: React.FC = () => {
	const [isImagePickerOpen, setImagePickerOpen] = useState(false);
	const [isUserSelectorOpen, setUserSelectorOpen] = useState(false);

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const icons = [<HouseIcon />, <SchoolIcon />, <OfficeIcon />];

	//DATETIME STUFF
	const [isDateTimeOpen, setDateTimeOpen] = useState(true);

	const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
	const [selectedTime, setSelectedTime] = useState<Date>(
		new Date(addHours(new Date(), 1).setMinutes(0))
	);
	const [recurrenceEndDate, setRecurrenceEndDate] = useState<
		Date | undefined
	>(undefined);
	const [isRecurring, setIsRecurring] = useState<boolean>(false);

	const [recurrenceIntervalValue, setRecurrenceIntervalValue] = useState<
		number | undefined
	>(undefined);

	const [recurrenceIntervalUnit, setRecurrenceIntervalUnit] = useState<
		string | undefined
	>(undefined);

	const users = [
		{ _id: "1", name: "Alice", avatar: "avatar.svg" },
		{ _id: "2", name: "Bob", avatar: "avatar.svg" },
		{ _id: "3", name: "Charlie", avatar: "avatar.svg" },
		{ _id: "4", name: "Diana", avatar: "avatar.svg" },
		{ _id: "5", name: "Eve", avatar: "avatar.svg" },
	];

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

			<button onClick={() => setUserSelectorOpen(true)}>
				<h3>Choose a user</h3>
			</button>

			{/* Button that opens the DateTimeSelector */}
			<button onClick={() => setDateTimeOpen(true)}>
				<h3>Date & Time</h3>
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

			{/* User Selector Modal */}
			<AutonomousModal
				isOpen={isUserSelectorOpen}
				onClose={() => setUserSelectorOpen(false)}
			>
				<UserSelector
					users={users}
					selectedUserIds={selectedUserIds}
					setSelectedUserIds={setSelectedUserIds}
				/>
				<button onClick={() => setUserSelectorOpen(false)}>
					Apply changes
				</button>
			</AutonomousModal>
			<AutonomousModal
				isOpen={isDateTimeOpen}
				onClose={() => setDateTimeOpen(false)}
			>
				<DateTimeSelector
					selectedDate={selectedDate}
					setSelectedDate={setSelectedDate}
					selectedTime={selectedTime}
					setSelectedTime={setSelectedTime}
					recurrenceEndDate={recurrenceEndDate}
					setRecurrenceEndDate={setRecurrenceEndDate}
					isRecurring={isRecurring}
					setIsRecurring={setIsRecurring}
					recurrenceIntervalUnit={recurrenceIntervalUnit}
					setRecurrenceIntervalUnit={setRecurrenceIntervalUnit}
					recurrenceIntervalValue={recurrenceIntervalValue}
					setRecurrenceIntervalValue={setRecurrenceIntervalValue}
				/>
				<button onClick={() => setDateTimeOpen(false)}>
					Apply changes
				</button>
			</AutonomousModal>
		</div>
	);
};

export default ExamplePage;
