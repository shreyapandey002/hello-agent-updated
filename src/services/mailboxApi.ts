export type Mailbox = {
  id: number;
  address: string;
  display_name: string | null;
  unread_count: number;
  incoming_count: number;
  sent_count: number;
  thread_count: number;
};

export type ThreadItem = {
  id: number;
  subject: string;
  contact_email: string | null;
  contact_name: string | null;
  unread: boolean;
  last_message_at: string | null;
  mailbox: string;
  message_count: number;
  last_direction: string | null;
  last_status: string | null;
  last_agent: string | null;
  preview: string;
};

export type MessageItem = {
  id: number;
  direction: 'inbound' | 'outbound';
  from_addr: string | null;
  to_addr: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  agent_name: string | null;
  status: string | null;
  metadata: Record<string, any>;
  created_at: string;
};

export type ThreadDetails = {
  id: number;
  subject: string;
  contact_email: string | null;
  contact_name: string | null;
  mailbox: string;
  last_message_at: string | null;
  unread: boolean;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });

  if (response.status === 401) {
    window.location.assign('/login');
    throw new Error('Unauthorized');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data as T;
}

export async function getMailboxes(): Promise<{ mailboxes: Mailbox[]; all_inboxes?: { incoming_count: number; sent_count: number; total_count: number } }> {
  return fetchJson('/api/mailboxes', { method: 'GET' });
}

export async function getThreads(params: { mailbox?: string; q?: string; filter?: 'all' | 'unread'; folder?: 'all' | 'incoming' | 'sent' }): Promise<{ threads: ThreadItem[] }> {
  const query = new URLSearchParams();

  if (params.mailbox && params.mailbox !== 'all') {
    query.set('mailbox', params.mailbox);
  }
  if (params.q) {
    query.set('q', params.q);
  }
  if (params.filter && params.filter !== 'all') {
    query.set('filter', params.filter);
  }
  if (params.folder && params.folder !== 'all') {
    query.set('folder', params.folder);
  }

  const url = `/api/threads${query.toString() ? `?${query.toString()}` : ''}`;
  return fetchJson(url, { method: 'GET' });
}

export async function getThread(id: string | number): Promise<{ thread: ThreadDetails; messages: MessageItem[] }> {
  return fetchJson(`/api/thread?id=${encodeURIComponent(String(id))}`, { method: 'GET' });
}
