// components/Modal.tsx
import React, { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	content?: React.ReactNode;
	children?: React.ReactNode;
}

const AutonomousModal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	content,
	children,
}) => {
	useEffect(() => {
		// Close modal on 'Escape' key press
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<dialog className="modal-overlay" onClick={onClose}>
			<article
				className="modal-content"
				onClick={(e) => e.stopPropagation()}
			>
				{content}
				{children}
			</article>
			<style jsx>{`
				.modal-overlay {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 1000;
				}
				.modal-content {
					padding: 2rem;
					border-radius: 8px;
					box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
				}
			`}</style>
		</dialog>,
		document.body
	);
};

export default AutonomousModal;
