import bcrypt from 'bcryptjs';
import { sql } from '../lib/db';
import { clearSessionCookie, createSessionCookie, json, parseBody } from '../lib/auth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const payload = parseBody(event);
    const name = String(payload.name ?? '').trim();
    const email = String(payload.email ?? '').trim().toLowerCase();
    const password = String(payload.password ?? '');

    if (!name || !email || !password) {
      return json(400, { error: 'Name, email and password are required' });
    }

    if (!emailRegex.test(email)) {
      return json(400, { error: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return json(400, { error: 'Password must be at least 8 characters long' });
    }

    const allowedDomainsRaw = process.env.ALLOWED_SIGNUP_DOMAINS || '';
    const allowedDomains = allowedDomainsRaw
      .split(',')
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean);

    if (allowedDomains.length > 0) {
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !allowedDomains.includes(domain)) {
        return json(403, { error: 'Company email required' });
      }
    }

    const existing = await sql`SELECT id FROM app_users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return json(409, { error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rows = await sql`
      INSERT INTO app_users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email
    `;

    const user = rows[0] as { id: number; name: string; email: string };

    return json(201, { user }, { 'Set-Cookie': createSessionCookie(user) });
  } catch (error: any) {
    return json(500, {
      error: 'Signup failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
