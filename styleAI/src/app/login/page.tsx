'use client';

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {

  const redirectUrl = process.env.NEXT_PUBLIC_BASE_PATH;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-center">Login</h1>
          <p className="text-center text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <div className="flex justify-center">
          <SignIn
            path="/login"
            routing="path"
            signUpUrl="/signup"
            redirectUrl={redirectUrl}
          />
        </div>
      </div>
    </div>
  );
}
