import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

interface ImagePickerProps {
	icons: React.ReactNode[]; // Array of SVG icons passed as React elements
	selectedIconIndex: number | null;
	setSelectedIconIndex: React.Dispatch<React.SetStateAction<number | null>>;
	mainColor: string;
	setMainColor: React.Dispatch<React.SetStateAction<string>>;
	backgroundColor: string;
	setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
	icons = [],
	selectedIconIndex = null,
	setSelectedIconIndex,
	mainColor = "#FFC2E2",
	setMainColor,
	backgroundColor = "#9236A4",
	setBackgroundColor,
}) => {
	const [showMainPicker, setShowMainPicker] = useState(false);
	const [showBgPicker, setShowBgPicker] = useState(false);

	// Debounce for HexColorPicker to prevent excessive updates
	const [tempMainColor, setTempMainColor] = useState(mainColor);
	const [tempBackgroundColor, setTempBackgroundColor] = useState(backgroundColor);



	const predefinedColors = [
		"#9236A4",
		"#D9A8F1",
		"#FFC2E2",
		"#F4D35E",
		"#B0DFE5",
		"#333333",
	];

	return (
		<div>
			<h2>Select an Icon</h2>
			<div className="icon-grid">
				{icons.map((icon, index) => (
					<div
						key={index}
						className={`icon ${index === selectedIconIndex ? "selected" : ""}`}
						onClick={() => setSelectedIconIndex(index)}
						style={{ backgroundColor }}
					>
						{React.cloneElement(icon as React.ReactElement, {
							color: mainColor,
						})}
					</div>
				))}
			</div>

			<h3>Main Color</h3>
			<div className="color-picker">
				{predefinedColors.map((color) => (
					<div
						key={color}
						className="color-swatch"
						style={{ backgroundColor: color }}
						onClick={() => setMainColor(color)}
					/>
				))}
				<div
					className="color-swatch plus-circle"
					onClick={() => setShowMainPicker(!showMainPicker)}
				>
					+
				</div>
				{showMainPicker && (
					<div className="picker-wrapper">
						<HexColorPicker
							color={tempMainColor}
							onChange={setTempMainColor}
						/>
						<button onClick={() => setShowMainPicker(false)}>Close</button>
					</div>
				)}
			</div>

			<h3>Background Color</h3>
			<div className="color-picker">
				{predefinedColors.map((color) => (
					<div
						key={color}
						className="color-swatch"
						style={{ backgroundColor: color }}
						onClick={() => setBackgroundColor(color)}
					/>
				))}
				<div
					className="color-swatch plus-circle"
					onClick={() => setShowBgPicker(!showBgPicker)}
				>
					+
				</div>
				{showBgPicker && (
					<div className="picker-wrapper">
						<HexColorPicker
							color={tempBackgroundColor}
							onChange={setTempBackgroundColor}
						/>
						<button onClick={() => setShowBgPicker(false)}>Close</button>
					</div>
				)}
			</div>

			{selectedIconIndex !== null && (
				<div className="preview">
					<h3>Preview</h3>
					<div className="icon-preview" style={{ backgroundColor }}>
						{React.cloneElement(
							icons[selectedIconIndex] as React.ReactElement,
							{ color: mainColor }
						)}
					</div>
				</div>
			)}

			<style jsx>{`
				.icon-grid {
					display: flex;
					flex-wrap: wrap;
					gap: 1rem;
					margin-bottom: 1rem;
				}
				.icon {
					width: 50px;
					height: 50px;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					border-radius: 8px;
					border: 2px solid transparent;
				}
				.icon.selected {
					border-color: #9236a4;
				}
				.color-picker {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					margin: 0.5rem 0;
				}
				.color-swatch {
					width: 24px;
					height: 24px;
					border-radius: 50%;
					cursor: pointer;
					box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
				}
				.preview {
					margin-top: 1rem;
				}
				.icon-preview {
					width: 100px;
					height: 100px;
					display: flex;
					align-items: center;
					justify-content: center;
					border-radius: 8px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
				}
			`}</style>
		</div>
	);
};

export default ImagePicker;
