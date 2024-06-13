"use client";
import { useGlobalState } from "@/app/context/globalProvider";
import React from "react";
interface Props {
	content: React.ReactNode;
}

function Modal({ content }: Props) {
	const { closeModal } = useGlobalState();

	const { theme } = useGlobalState();
	return (
		<div className="modal">
			<div className="modal-overlay" onClick={closeModal}></div>
			<div className="modal-content">{content}</div>
		</div>
	);
}

export default Modal;
