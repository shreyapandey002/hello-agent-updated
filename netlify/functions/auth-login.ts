import bcrypt from 'bcryptjs';
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
    const adminEmail = String(process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
    const adminPasswordHash = String(process.env.ADMIN_PASSWORD_HASH ?? '').trim();

    if (!adminEmail || !adminPasswordHash) {
      return json(500, { error: 'Admin login is not configured' });
    }

    if (!emailRegex.test(email) || password.length === 0) {
      return json(401, { error: 'Invalid email or password' });
    }

    if (email !== adminEmail) {
      return json(401, { error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, adminPasswordHash);
    if (!passwordMatches) {
      return json(401, { error: 'Invalid email or password' });
    }

    const safeUser = {
      id: 1,
      name: 'Admin',
      email: adminEmail,
    };

    return json(200, { user: safeUser }, { 'Set-Cookie': createSessionCookie(safeUser) });
  } catch (error: any) {
    return json(500, {
      error: 'Admin login is not configured',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
