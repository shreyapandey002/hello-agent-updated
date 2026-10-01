import { getSessionUser, json } from '../lib/auth';
import { sql } from '../lib/db';

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const user = getSessionUser(event);

  if (!user) {
    return json(401, { error: 'Unauthorized' });
  }

  try {
    const rows = await sql`
      SELECT
        m.id,
        m.address,
        m.display_name,
        COALESCE((SELECT COUNT(*) FROM mail_threads mt WHERE mt.mailbox_id = m.id AND mt.unread = true), 0) AS unread_count,
        COALESCE((SELECT COUNT(*) FROM mail_threads mt WHERE mt.mailbox_id = m.id), 0) AS thread_count
      FROM mailboxes m
      ORDER BY m.address ASC
    `;

    return json(200, {
      mailboxes: rows.map((row: any) => ({
        id: Number(row.id),
        address: row.address,
        display_name: row.display_name,
        unread_count: Number(row.unread_count),
        thread_count: Number(row.thread_count),
      })),
    });
  } catch (error: any) {
    return json(500, {
      error: 'Failed to load mailboxes',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
