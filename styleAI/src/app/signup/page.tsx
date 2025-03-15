'use client';

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const redirectUrl = process.env.NEXT_PUBLIC_BASE_PATH;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
          <p className="text-center text-gray-600 mt-2">Create a new account</p>
        </div>
        
        <div className="flex justify-center">
          <SignUp
            path="/signup"
            routing="path"
            signInUrl="/login"
            redirectUrl={redirectUrl}
          />
        </div>
      </div>
    </div>
  );
} 