export interface User {
  id: string;
  provider: string;
  provider_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  github_profile_url?: string;
  bio?: string;
  access_token?: string;
  refresh_token?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  provider: string;
  provider_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  github_profile_url?: string;
  bio?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  avatar_url?: string;
  github_profile_url?: string;
  bio?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface UserLoginInput {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  user: User;
  token: string;
}