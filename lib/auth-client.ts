"use client";

const tokenKey = "auth_token";
const profileKey = "auth_profile";
const usersKey = "devnotch_users"; // Store all registered users

export type UserProfile = {
  name: string;
  email: string;
};

export type StoredUser = {
  name: string;
  email: string;
  password: string; // In production, this should be hashed
  createdAt: string;
};

// ==================== Token & Profile Management ====================

export function setAuthToken(token: string) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${tokenKey}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function getAuthToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${tokenKey}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(profileKey, JSON.stringify(profile));
  } catch (_error) {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(profileKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed?.name || !parsed?.email) return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

export function clearUserProfile() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(profileKey);
  } catch (_error) {
    // Ignore storage failures
  }
}

export function clearAuthToken() {
  if (typeof document === "undefined") return;
  document.cookie = `${tokenKey}=; path=/; max-age=0; samesite=lax`;
  clearUserProfile();
}

// ==================== User Registration & Authentication ====================

/**
 * Get all registered users from localStorage
 */
function getAllUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(usersKey);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch (_error) {
    return [];
  }
}

/**
 * Save all users to localStorage
 */
function saveAllUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(usersKey, JSON.stringify(users));
  } catch (_error) {
    console.error("Failed to save users to localStorage");
  }
}

/**
 * Check if email already exists
 */
export function isEmailRegistered(email: string): boolean {
  const users = getAllUsers();
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Create new account (Sign Up)
 * Returns success status and message
 */
export function createAccount(
  name: string,
  email: string,
  password: string
): { success: boolean; message: string } {
  // Validation
  if (!name || name.trim().length < 2) {
    return { success: false, message: "Name must be at least 2 characters" };
  }

  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address" };
  }

  if (!password || password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  // Check if email already exists
  if (isEmailRegistered(email)) {
    return { success: false, message: "Email already registered. Please sign in." };
  }

  // Create new user
  const newUser: StoredUser = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: password, // In production, hash this with bcrypt or similar
    createdAt: new Date().toISOString(),
  };

  // Save to localStorage
  const users = getAllUsers();
  users.push(newUser);
  saveAllUsers(users);

  console.log("✅ Account created successfully:", { name, email });

  return { success: true, message: "Account created successfully!" };
}

/**
 * Sign in (Authenticate user)
 * Returns success status, message, and user profile if successful
 */
export function signIn(
  email: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } {
  // Validation
  if (!email || !password) {
    return { success: false, message: "Please enter email and password" };
  }

  // Find user
  const users = getAllUsers();
  
  // Check if email exists
  const userWithEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!userWithEmail) {
    // Email not registered
    return { success: false, message: "No account found. Please create an account first." };
  }
  
  // Email exists, check password
  if (userWithEmail.password !== password) {
    return { success: false, message: "Invalid password. Please try again." };
  }

  // Success - Create auth token and save profile
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2)}`;
  setAuthToken(token);
  
  const profile: UserProfile = {
    name: userWithEmail.name,
    email: userWithEmail.email,
  };
  setUserProfile(profile);

  console.log("✅ Signed in successfully:", { email });

  return {
    success: true,
    message: "Signed in successfully!",
    user: profile,
  };
}

/**
 * Sign out (Clear all auth data)
 */
export function signOut(): void {
  clearAuthToken();
  clearUserProfile();
  console.log("✅ Signed out successfully");
}

/**
 * Delete account (Remove user from localStorage)
 */
export function deleteAccount(email: string, password: string): { success: boolean; message: string } {
  const users = getAllUsers();
  const userIndex = users.findIndex(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (userIndex === -1) {
    return { success: false, message: "Invalid credentials" };
  }

  users.splice(userIndex, 1);
  saveAllUsers(users);
  signOut();

  console.log("✅ Account deleted successfully:", { email });

  return { success: true, message: "Account deleted successfully" };
}

/**
 * Get all registered users (for debugging only - remove in production)
 */
export function debugGetAllUsers(): StoredUser[] {
  return getAllUsers();
}

/**
 * Clear all users (for debugging only - remove in production)
 */
export function debugClearAllUsers(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(usersKey);
  console.log("✅ All users cleared from localStorage");
}
