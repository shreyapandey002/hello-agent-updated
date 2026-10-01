import jwt from 'jsonwebtoken';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Cache-Control': 'no-store',
};

export const json = (statusCode: number, body: any, extraHeaders: Record<string, string> = {}) => ({
  statusCode,
  headers: { ...jsonHeaders, ...extraHeaders },
  body: JSON.stringify(body),
});

const secureCookieSuffix = process.env.NODE_ENV === 'production' ? '; Secure' : '';

export const createSessionCookie = (user: { id: number; email: string; name?: string | null }) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name ?? null },
    secret,
    { expiresIn: '7d' }
  );

  return `ha_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${secureCookieSuffix}`;
};

export const clearSessionCookie = () => `ha_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureCookieSuffix}`;

export const getSessionUser = (event: any) => {
  const cookieHeader = event?.headers?.cookie || event?.headers?.Cookie || '';
  const cookie = cookieHeader
    .split(';')
    .map((entry: string) => entry.trim())
    .find((entry: string) => entry.startsWith('ha_session='));

  if (!cookie) {
    return null;
  }

  const token = cookie.slice('ha_session='.length);
  const secret = process.env.JWT_SECRET;

  if (!secret || !token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id?: number;
      email?: string;
      name?: string | null;
    };

    if (!decoded.id || !decoded.email) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name ?? null,
    };
  } catch {
    return null;
  }
};

export const parseBody = (event: any) => {
  if (!event || !event.body) {
    return {};
  }

  if (typeof event.body === 'object') {
    return event.body;
  }

  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
};
