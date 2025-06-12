import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByProvider, autoSyncClerkUser } from "@/lib/models/user";

/**
 * Get current user's credits
 * @returns User credits information
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Getting credits for Clerk user:", userId);

    // Get user from database using Clerk ID
    let user = await getUserByProvider("clerk", userId);

    // If user doesn't exist in database, sync from Clerk
    if (!user) {
      console.log("User not found in database, syncing from Clerk...");
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return NextResponse.json(
          { error: "Unable to get user from Clerk" },
          { status: 401 }
        );
      }

      // Auto-sync the user to database
      user = await autoSyncClerkUser(clerkUser);

      if (!user) {
        return NextResponse.json(
          { error: "Failed to sync user" },
          { status: 500 }
        );
      }

      console.log("User synced successfully:", user.id);
    }

    return NextResponse.json({
      credits: user.credits || 0,
      userId: user.id,
    });
  } catch (error) {
    console.error("Error getting user credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
