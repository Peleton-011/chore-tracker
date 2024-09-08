import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout } from "@/app/utils/Icons";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import Button from "../Button/Button";

const Profile = () => {
	const { user } = useUser();
	const router = useRouter();

	const { firstName, lastName, imageUrl } = user || {
		firstName: "Ipi",
		lastName: "Bola",
		imageUrl: "/../../public/avatar.png",
	};

	const { signOut } = useClerk();

	return <UserButton />;
	return (
		<>
			<div className="profile">
				<div className="profile-overlay"></div>
				<div className="image">
					<Image
						width={70}
						height={70}
						src={imageUrl}
						alt="profile"
					/>
				</div>
				<div className="user-btn">
					<UserButton />
				</div>
				<h1 className="capitalize">
					{firstName} {lastName}
				</h1>
			</div>
			<Button
				name={"Sign Out"}
				type={"submit"}
				padding={"0.4rem 0.8rem"}
				borderRad={"0.8rem"}
				fw={"500"}
				fs={"1.2rem"}
				icon={logout}
				click={() => {
					signOut(() => router.push("/signin"));
				}}
			/>
		</>
	);
};

export default Profile;
