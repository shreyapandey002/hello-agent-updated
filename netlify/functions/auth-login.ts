import bcrypt from 'bcryptjs';
import { sql } from '../lib/db';
import { createSessionCookie, json, parseBody } from '../lib/auth';

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
    const email = String(payload.email ?? '').trim().toLowerCase();
    const password = String(payload.password ?? '');

    if (!emailRegex.test(email) || password.length < 8) {
      return json(401, { error: 'Invalid email or password' });
    }

    const rows = await sql`
      SELECT id, name, email, password_hash
      FROM app_users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = rows[0];
    if (!user) {
      return json(401, { error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return json(401, { error: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return json(200, { user: safeUser }, { 'Set-Cookie': createSessionCookie(safeUser) });
  } catch (error: any) {
    return json(500, {
      error: 'Login failed',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
