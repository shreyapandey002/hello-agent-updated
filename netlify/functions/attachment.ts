import { getSessionUser, json } from '../lib/auth';

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  if (!getSessionUser(event)) {
    return json(401, { error: 'Unauthorized' });
  }

  const emailId = event.queryStringParameters?.email_id;
  const attachmentId = event.queryStringParameters?.attachment_id;
  if (!emailId || !attachmentId) {
    return json(400, { error: 'Email id and attachment id are required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'Attachment service is not configured' });
  }

  try {
    const response = await fetch(
      `https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      return json(response.status === 404 ? 404 : 502, {
        error: response.status === 404 ? 'Attachment not found' : 'Unable to retrieve attachment',
      });
    }

    const attachment = await response.json();
    const downloadUrl = attachment.download_url;
    if (typeof downloadUrl !== 'string' || !downloadUrl.startsWith('https://')) {
      return json(502, { error: 'Resend returned an invalid attachment URL' });
    }

    return {
      statusCode: 302,
      headers: {
        Location: downloadUrl,
        'Cache-Control': 'no-store',
      },
      body: '',
    };
  } catch {
    return json(502, { error: 'Unable to retrieve attachment' });
  }
};
