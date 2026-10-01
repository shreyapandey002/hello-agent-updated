import { clearSessionCookie, json } from '../lib/auth';

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  return json(200, { success: true }, { 'Set-Cookie': clearSessionCookie() });
};
