// Client-side checks mirror backend Zod schemas (src/validators/schemas.js). The server remains authoritative.

export type Errors<T extends string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function validateRegister(v: { username: string; name: string; email: string; password: string }) {
  const e: Errors<keyof typeof v> = {};
  const username = v.username.trim();
  if (username.length < 3 || username.length > 40) e.username = 'Username must be 3–40 characters';
  else if (!USERNAME_RE.test(username)) e.username = 'Only letters, numbers, dot, underscore and dash';
  if (!v.name.trim()) e.name = 'Please enter your name';
  if (!isEmail(v.email)) e.email = 'Enter a valid email address';
  if (v.password.length < 6) e.password = 'Password must be at least 6 characters';
  else if (v.password.length > 128) e.password = 'Password is too long';
  return e;
}

export function validateLogin(v: { identifier: string; password: string }) {
  const e: Errors<keyof typeof v> = {};
  if (!v.identifier.trim()) e.identifier = 'Enter your username or email';
  if (!v.password) e.password = 'Enter your password';
  return e;
}

export function validateOtp(v: { otp: string }) {
  const e: Errors<'otp'> = {};
  if (!/^\d{6}$/.test(v.otp.trim())) e.otp = 'Enter the 6-digit code';
  return e;
}

export function validateReset(v: { otp: string; newPassword: string; confirmNewPassword: string }) {
  const e: Errors<keyof typeof v> = {};
  if (!/^\d{4,8}$/.test(v.otp.trim())) e.otp = 'Enter the code from your email';
  if (v.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
  if (v.newPassword !== v.confirmNewPassword) e.confirmNewPassword = 'Passwords do not match';
  return e;
}

export function cleanIngredients(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const t = item.trim().replace(/\s+/g, ' ');
    const key = t.toLowerCase();
    if (t && !seen.has(key)) {
      seen.add(key);
      out.push(t.slice(0, 80));
    }
  }
  return out.slice(0, 30);
}

export function validateGenerate(v: { ingredients: string[]; servings: number; medical: string }) {
  const e: Errors<'ingredients' | 'servings' | 'medical'> = {};
  if (cleanIngredients(v.ingredients).length === 0) e.ingredients = 'Add at least one ingredient';
  if (!Number.isInteger(v.servings) || v.servings < 1 || v.servings > 50) e.servings = 'Servings must be 1–50';
  if (v.medical.length > 500) e.medical = 'Keep notes under 500 characters';
  return e;
}
