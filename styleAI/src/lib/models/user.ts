import { query } from "../db";
import { User } from "../../types/user";

// Create new user
export async function createUser(userData: {
  email: string;
  password_hash?: string;
  name?: string;
  provider?: string;
  provider_id?: string;
  avatar_url?: string;
}): Promise<any> {
  try {
    const { email, password_hash, name, provider, provider_id, avatar_url } =
      userData;

    const result = await query(
      `INSERT INTO users (
        email, password_hash, name, provider, provider_id, avatar_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [email, password_hash, name, provider, provider_id, avatar_url]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<any | null> {
  try {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

// Get user by provider and provider_id
export async function getUserByProvider(
  provider: string,
  providerId: string
): Promise<any | null> {
  try {
    const result = await query(
      "SELECT * FROM users WHERE provider = $1 AND provider_id = $2",
      [provider, providerId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error getting user by provider:", error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<any | null> {
  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

// Get all users
export async function getAllUsers(): Promise<any[]> {
  try {
    const result = await query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

// Update user information
export async function updateUser(
  id: number,
  userData: Partial<{
    email: string;
    password_hash: string;
    name: string;
    avatar_url: string;
  }>
): Promise<any | null> {
  try {
    // Build update fields dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (userData.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }

    if (userData.password_hash !== undefined) {
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(userData.password_hash);
    }

    if (userData.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(userData.name);
    }

    if (userData.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(userData.avatar_url);
    }

    // Add updated_at field update
    updates.push(`updated_at = NOW()`);

    // If no fields to update, return null
    if (updates.length === 1) {
      return null;
    }

    values.push(id);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id: number): Promise<boolean> {
  try {
    const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [
      id,
    ]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Update user's Stripe customer ID
export async function updateUserStripeCustomerId(
  userId: number,
  stripeCustomerId: string
): Promise<any | null> {
  try {
    const result = await query(
      `UPDATE users 
       SET stripe_customer_id = $1, updated_at = NOW()
       WHERE id = $2 
       RETURNING *`,
      [stripeCustomerId, userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error updating user Stripe customer ID:", error);
    throw error;
  }
}

// Add credits to user
export async function addUserCredits(
  userId: number,
  creditsToAdd: number
): Promise<any | null> {
  try {
    const result = await query(
      `UPDATE users 
       SET credits = credits + $1, updated_at = NOW()
       WHERE id = $2 
       RETURNING *`,
      [creditsToAdd, userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error adding user credits:", error);
    throw error;
  }
}

// Get user by Stripe customer ID
export async function getUserByStripeCustomerId(
  stripeCustomerId: string
): Promise<any | null> {
  try {
    const result = await query(
      "SELECT * FROM users WHERE stripe_customer_id = $1",
      [stripeCustomerId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error getting user by Stripe customer ID:", error);
    throw error;
  }
}

/**
 * Auto-sync Clerk user to database
 * Creates user if not exists, updates if exists
 */
export async function autoSyncClerkUser(clerkUser: any) {
  const provider = clerkUser.externalAccounts[0]?.provider || "clerk";
  const providerId = clerkUser.externalAccounts[0]?.externalId || clerkUser.id;
  const username = clerkUser.username || clerkUser.firstName || "user";
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const avatarUrl = clerkUser.imageUrl;
  const bio = (clerkUser.publicMetadata?.bio as string) || "";

  let userId;

  // First check if user exists by provider and providerId
  const existingUserByProvider = await getUserByProvider(provider, providerId);

  if (existingUserByProvider) {
    // User exists, update info
    userId = existingUserByProvider.id;
    console.log(
      `User exists (provider: ${provider}, id: ${providerId}), updating info`
    );

    const updateQuery = `
      UPDATE users 
      SET 
        username = $1,
        avatar_url = $2,
        bio = $3,
        updated_at = NOW()
      WHERE id = $4
    `;

    await query(updateQuery, [username, avatarUrl, bio, userId]);
  } else if (email) {
    // Check if user exists by email
    const checkUserByEmailQuery = `
      SELECT * FROM users 
      WHERE email = $1
    `;
    const existingUserByEmail = await query(checkUserByEmailQuery, [email]);

    if (existingUserByEmail.rows.length > 0) {
      // User exists by email, update provider info
      const existingUser = existingUserByEmail.rows[0];
      userId = existingUser.id;
      console.log(`User exists by email: ${email}, updating provider info`);

      const updateUserQuery = `
        UPDATE users 
        SET 
          provider = $1,
          provider_id = $2,
          username = $3,
          avatar_url = $4,
          bio = $5,
          updated_at = NOW()
        WHERE id = $6
      `;

      await query(updateUserQuery, [
        provider,
        providerId,
        username,
        avatarUrl,
        bio,
        userId,
      ]);
    } else {
      // Create new user
      console.log("Creating new user with email");

      const insertQuery = `
        INSERT INTO users (
          provider,
          provider_id,
          username,
          email,
          avatar_url,
          bio
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const result = await query(insertQuery, [
        provider,
        providerId,
        username,
        email,
        avatarUrl,
        bio,
      ]);

      userId = result.rows[0].id;
      console.log(`Successfully created user with ID: ${userId}`);
    }
  } else {
    // Create new user without email
    console.log("Creating new user without email");

    const insertQuery = `
      INSERT INTO users (
        provider,
        provider_id,
        username,
        avatar_url,
        bio
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await query(insertQuery, [
      provider,
      providerId,
      username,
      avatarUrl,
      bio,
    ]);

    userId = result.rows[0].id;
    console.log(`Successfully created user with ID: ${userId}`);
  }

  // Return the user from database
  return getUserById(userId);
}
