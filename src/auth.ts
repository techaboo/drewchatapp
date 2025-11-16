// Generate a random ID for users and sessions
export function generateId(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Hash a password using Web Crypto API (compatible with Cloudflare Workers)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = generateId(); // Use random salt
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${salt}:${hashHex}`;
}

// Verify a password against its hash
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  try {
    if (!passwordHash.startsWith("sha256:")) {
      return false;
    }

    const parts = passwordHash.split(":");
    if (parts.length !== 3) {
      return false;
    }

    const salt = parts[1];
    const storedHash = parts[2];

    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedHash === storedHash;
  } catch (err) {
    console.error("Error verifying password:", err);
    return false;
  }
}

// Session payload type
export interface SessionPayload {
  userId: string;
  expiresAt: number;
}

// Encode session to base64 JWT-like format
export function encodeSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  // Use btoa for base64 encoding (available in Workers)
  return btoa(json);
}

// Decode session from base64 JWT-like format
export function decodeSession(token: string): SessionPayload | null {
  try {
    // Use atob for base64 decoding (available in Workers)
    const decoded = JSON.parse(atob(token));
    if (
      decoded.userId &&
      typeof decoded.userId === "string" &&
      typeof decoded.expiresAt === "number"
    ) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

// Verify if session is still valid
export function isSessionValid(session: SessionPayload): boolean {
  return session.expiresAt > Date.now();
}

// Create a new session (valid for 30 days)
export function createSession(userId: string): SessionPayload {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  return { userId, expiresAt };
}
