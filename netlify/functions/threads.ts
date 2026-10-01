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
    const query = event.queryStringParameters || {};
    const mailbox = String(query.mailbox ?? 'all').trim();
    const q = String(query.q ?? '').trim();
    const filter = String(query.filter ?? 'all').trim();
    const folder = String(query.folder ?? 'all').trim();
    const mailboxFilter = mailbox && mailbox !== 'all' ? mailbox : null;
    const searchPattern = q ? `%${q}%` : '%';

    if (folder === 'incoming' || folder === 'sent') {
      const direction = folder === 'incoming' ? 'inbound' : 'outbound';
      const emailConditions: any[] = [sql`mm.direction = ${direction}`];

      if (mailboxFilter) {
        emailConditions.push(sql`mb.address = ${mailboxFilter}`);
      }
      if (filter === 'unread') {
        emailConditions.push(sql`mt.unread = true`);
      }
      if (q) {
        emailConditions.push(sql`(
          mm.subject ILIKE ${searchPattern} OR
          mm.from_addr ILIKE ${searchPattern} OR
          mm.to_addr ILIKE ${searchPattern} OR
          mm.body_text ILIKE ${searchPattern} OR
          mt.contact_email ILIKE ${searchPattern} OR
          mt.contact_name ILIKE ${searchPattern}
        )`);
      }

      const emailWhereClause = sql`WHERE ${emailConditions.slice(1).reduce(
        (acc, condition) => sql`${acc} AND ${condition}`,
        emailConditions[0]
      )}`;
      const emailRows = await sql`
        SELECT
          mm.id,
          mm.thread_id,
          mm.direction,
          mm.from_addr,
          mm.to_addr,
          mm.subject,
          mm.body_text,
          mm.body_html,
          mm.agent_name,
          mm.status,
          mm.metadata,
          mm.created_at,
          mt.contact_email,
          mt.contact_name,
          mt.unread AS thread_unread,
          mb.address AS mailbox,
          COALESCE(substring(COALESCE(mm.body_text, mm.body_html) FROM 1 FOR 160), '') AS preview
        FROM mail_messages mm
        JOIN mail_threads mt ON mt.id = mm.thread_id
        JOIN mailboxes mb ON mb.id = mt.mailbox_id
        ${emailWhereClause}
        ORDER BY mm.created_at DESC NULLS LAST
        LIMIT 100
      `;

      return json(200, {
        emails: emailRows.map((row: any) => ({
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
          contact_email: row.contact_email,
          contact_name: row.contact_name,
          thread_unread: Boolean(row.thread_unread),
          mailbox: row.mailbox,
          preview: row.preview || '',
        })),
      });
    }

    const filterConditions: any[] = [];

    if (mailboxFilter) {
      filterConditions.push(sql`mb.address = ${mailboxFilter}`);
    }

    if (filter === 'unread') {
      filterConditions.push(sql`mt.unread = true`);
    }

    if (q !== '') {
      filterConditions.push(sql`(
        mt.subject ILIKE ${searchPattern} OR
        mt.contact_email ILIKE ${searchPattern} OR
        mt.contact_name ILIKE ${searchPattern} OR
        EXISTS (
          SELECT 1
          FROM mail_messages msg
          WHERE msg.thread_id = mt.id AND msg.body_text ILIKE ${searchPattern}
        )
      )`);
    }

    const whereClause = filterConditions.length > 0
      ? sql`WHERE ${filterConditions.slice(1).reduce(
          (acc, condition) => sql`${acc} AND ${condition}`,
          filterConditions[0]
        )}`
      : sql``;

    const rows = await sql`
      WITH latest_message AS (
        SELECT DISTINCT ON (mt.id)
          mt.id AS thread_id,
          mm.direction AS last_direction,
          mm.status AS last_status,
          mm.agent_name AS last_agent,
          mm.body_text AS last_body_text,
          mm.created_at AS last_message_at
        FROM mail_threads mt
        LEFT JOIN mail_messages mm ON mm.thread_id = mt.id
        ORDER BY mt.id, mm.created_at DESC
      )
      SELECT
        mt.id,
        mt.subject,
        mt.contact_email,
        mt.contact_name,
        mt.unread,
        mt.last_message_at,
        mb.address AS mailbox,
        COALESCE(mc.message_count, 0) AS message_count,
        lm.last_direction,
        lm.last_status,
        lm.last_agent,
        COALESCE(substring(lm.last_body_text FROM 1 FOR 160), '') AS preview
      FROM mail_threads mt
      JOIN mailboxes mb ON mb.id = mt.mailbox_id
      LEFT JOIN (
        SELECT thread_id, COUNT(*) AS message_count
        FROM mail_messages
        GROUP BY thread_id
      ) mc ON mc.thread_id = mt.id
      LEFT JOIN latest_message lm ON lm.thread_id = mt.id
      ${whereClause}
      ORDER BY mt.last_message_at DESC NULLS LAST
      LIMIT 100
    `;

    return json(200, {
      threads: rows.map((row: any) => ({
        id: Number(row.id),
        subject: row.subject,
        contact_email: row.contact_email,
        contact_name: row.contact_name,
        unread: Boolean(row.unread),
        last_message_at: row.last_message_at,
        mailbox: row.mailbox,
        message_count: Number(row.message_count || 0),
        last_direction: row.last_direction,
        last_status: row.last_status,
        last_agent: row.last_agent,
        preview: row.preview || '',
      })),
    });
  } catch (error: any) {
    return json(500, {
      error: 'Failed to load threads',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
