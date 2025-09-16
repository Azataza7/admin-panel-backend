import crypto from "crypto";

export async function generatePassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const bytes = crypto.randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i++) {
    // @ts-ignore
    password += chars[bytes[i] % chars.length];
  }

  return password;
}
