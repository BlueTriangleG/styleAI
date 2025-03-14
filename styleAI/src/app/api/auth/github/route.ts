import { NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL}/api/auth/github/callback`;

export async function GET() {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
}