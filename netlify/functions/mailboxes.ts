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
        mb.id,
        mb.address,
        mb.display_name,
        COALESCE((SELECT COUNT(DISTINCT t.id) FROM mail_threads t WHERE t.mailbox_id = mb.id AND t.unread = true), 0) AS unread_count,
        COALESCE((SELECT COUNT(DISTINCT t.id) FROM mail_threads t WHERE t.mailbox_id = mb.id), 0) AS thread_count,
        COALESCE((
          SELECT COUNT(msg.id)
          FROM mail_messages msg
          JOIN mail_threads t ON t.id = msg.thread_id
          WHERE t.mailbox_id = mb.id AND msg.direction = 'inbound'
        ), 0) AS incoming_count,
        COALESCE((
          SELECT COUNT(msg.id)
          FROM mail_messages msg
          JOIN mail_threads t ON t.id = msg.thread_id
          WHERE t.mailbox_id = mb.id AND msg.direction = 'outbound'
        ), 0) AS sent_count
      FROM mailboxes mb
      ORDER BY mb.address ASC
    `;

    const mailboxes = rows.map((row: any) => ({
      id: Number(row.id),
      address: row.address,
      display_name: row.display_name,
      unread_count: Number(row.unread_count),
      incoming_count: Number(row.incoming_count),
      sent_count: Number(row.sent_count),
      thread_count: Number(row.thread_count),
    }));

    const allIncoming = mailboxes.reduce((sum, mailbox) => sum + mailbox.incoming_count, 0);
    const allSent = mailboxes.reduce((sum, mailbox) => sum + mailbox.sent_count, 0);

    return json(200, {
      all_inboxes: {
        incoming_count: allIncoming,
        sent_count: allSent,
        total_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.thread_count, 0),
      },
      mailboxes,
    });
  } catch (error: any) {
    return json(500, {
      error: 'Failed to load mailboxes',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
