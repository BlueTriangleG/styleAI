"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login");
    }
  }, [isLoaded, user, router]);

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{user?.fullName || "Not set"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">
                {user?.primaryEmailAddress?.emailAddress || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="mt-1 text-gray-900">{user?.username || "Not set"}</p>
            </div>
          </div>
          <div className="mt-6">
            <a
              href="https://accounts.clerk.dev/user/profile"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Edit Profile
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Created
              </label>
              <p className="mt-1 text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Updated
              </label>
              <p className="mt-1 text-gray-900">
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <a
              href="https://accounts.clerk.dev/user/security"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Security Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
