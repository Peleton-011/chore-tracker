import { authMiddleware } from "@clerk/nextjs/server";
// import { clerkMiddleware } from "./middleware/clerkMiddleware";
import { NextRequest } from "next/server";

// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your Middleware

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

export default authMiddleware({
	ignoredRoutes: ["/((?!api|trpc))(_next.*|.+.[w]+$)", "/api/webhook"],
	...config,
	// Allow signed out users to access the specified routes:
	// publicRoutes: ['/anyone-can-visit-this-route'],
});

async function middleware(req: NextRequest) {
	// return authMiddleware(req);
	// return clerkMiddleware(req);
}
