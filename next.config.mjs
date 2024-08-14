/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["localhost", "https://img.clerk.com", "img.clerk.com"],
	},
	env: {
		CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
		PORT: process.env.PORT,
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		NEXT_PUBLIC_CLERK_SIGN_IN_URL:
			process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
		NEXT_PUBLIC_CLERK_SIGN_UP_URL:
			process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
		NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
			process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
		NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
			process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
		NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL:
			process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL,
		MONGODB_URI: process.env.MONGODB_URI,
	},
};

export default nextConfig;
