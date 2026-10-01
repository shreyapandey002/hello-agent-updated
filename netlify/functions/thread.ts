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
    const messageIdRaw = event.queryStringParameters?.message_id;
    if (messageIdRaw) {
      const messageId = Number(messageIdRaw);
      if (!Number.isFinite(messageId) || messageId <= 0) {
        return json(400, { error: 'Message id is invalid' });
      }

      const rows = await sql`
        SELECT
          mt.id AS thread_id,
          mt.subject AS thread_subject,
          mt.contact_email,
          mt.contact_name,
          mt.last_message_at,
          mt.unread,
          mb.address AS mailbox,
          mm.id,
          mm.direction,
          mm.from_addr,
          mm.to_addr,
          mm.subject,
          mm.body_text,
          mm.body_html,
          mm.agent_name,
          mm.status,
          mm.metadata,
          mm.created_at
        FROM mail_messages mm
        JOIN mail_threads mt ON mt.id = mm.thread_id
        JOIN mailboxes mb ON mb.id = mt.mailbox_id
        WHERE mm.id = ${messageId}
        LIMIT 1
      `;
      const row = rows[0];
      if (!row) {
        return json(404, { error: 'Email not found' });
      }

      await sql`UPDATE mail_threads SET unread = false WHERE id = ${row.thread_id}`;

      return json(200, {
        thread: {
          id: Number(row.thread_id),
          subject: row.thread_subject,
          contact_email: row.contact_email,
          contact_name: row.contact_name,
          mailbox: row.mailbox,
          last_message_at: row.last_message_at,
          unread: false,
        },
        message: {
          id: Number(row.id),
          thread_id: Number(row.thread_id),
          direction: row.direction,
          from_addr: row.from_addr,
          to_addr: row.to_addr,
          subject: row.subject,
          body_text: row.body_text,
          body_html: row.body_html,
          agent_name: row.agent_name,
          status: row.status,
          metadata: row.metadata ?? {},
          created_at: row.created_at,
        },
      });
    }

    const threadIdRaw = event.queryStringParameters?.id;
    const threadId = Number(threadIdRaw);

    if (!threadIdRaw || !Number.isFinite(threadId) || threadId <= 0) {
      return json(400, { error: 'Thread id is required' });
    }

    const threadRows = await sql`
      SELECT
        mt.id,
        mt.subject,
        mt.contact_email,
        mt.contact_name,
        mt.last_message_at,
        mt.unread,
        mb.address AS mailbox
      FROM mail_threads mt
      JOIN mailboxes mb ON mb.id = mt.mailbox_id
      WHERE mt.id = ${threadId}
      LIMIT 1
    `;

    const threadRow = threadRows[0];
    if (!threadRow) {
      return json(404, { error: 'Thread not found' });
    }

    const messageRows = await sql`
      SELECT
        id,
        direction,
        from_addr,
        to_addr,
        subject,
        body_text,
        body_html,
        agent_name,
        status,
        metadata,
        created_at
      FROM mail_messages
      WHERE thread_id = ${threadId}
      ORDER BY created_at ASC
    `;

    await sql`UPDATE mail_threads SET unread = false WHERE id = ${threadId}`;

    return json(200, {
      thread: {
        id: Number(threadRow.id),
        subject: threadRow.subject,
        contact_email: threadRow.contact_email,
        contact_name: threadRow.contact_name,
        mailbox: threadRow.mailbox,
        last_message_at: threadRow.last_message_at,
        unread: false,
      },
      messages: messageRows.map((message: any) => ({
        id: Number(message.id),
        direction: message.direction,
        from_addr: message.from_addr,
        to_addr: message.to_addr,
        subject: message.subject,
        body_text: message.body_text,
        body_html: message.body_html,
        agent_name: message.agent_name,
        status: message.status,
        metadata: message.metadata ?? {},
        created_at: message.created_at,
      })),
    });
  } catch (error: any) {
    return json(500, {
      error: 'Failed to load thread',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
