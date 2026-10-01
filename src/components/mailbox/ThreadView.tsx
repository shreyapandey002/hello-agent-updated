import { AlertTriangle, ChevronDown, Mail, Sparkles } from 'lucide-react';
import type { MessageItem, ThreadDetails } from '../../services/mailboxApi';

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function parseMetadata(metadata: Record<string, any> | undefined) {
  if (!metadata || typeof metadata !== 'object') return null;

  const keys = ['consultation_date', 'consultation_time', 'company_name', 'use_case', 'google_meet_link'];
  const found = keys.filter((key) => metadata[key] !== undefined && metadata[key] !== null && metadata[key] !== '');
  if (!found.length) return null;

  return found.reduce<Record<string, string>>((acc, key) => {
    acc[key] = String(metadata[key]);
    return acc;
  }, {});
}

export function ThreadView({
  thread,
  messages,
  loading,
  error,
  onRetry,
  isDark,
}: {
  thread: ThreadDetails | null;
  messages: MessageItem[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  isDark: boolean;
}) {
  const shell = isDark ? 'bg-[#111827] text-slate-100' : 'bg-[#f7f7f5] text-slate-900';
  const border = isDark ? 'border-slate-800' : 'border-slate-200';
  const soft = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-slate-100' : 'text-slate-900';
  const card = isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white';
  const cardMuted = isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700';

  if (loading) {
    return (
      <div className={`flex h-full items-center justify-center p-6 ${shell}`}>
        <div className={`space-y-4 text-center ${soft}`}>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <div>Loading conversation…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-full items-center justify-center p-6 ${shell}`}>
        <div className={isDark ? 'max-w-md rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-200' : 'max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700'}>
          <div className="mb-2 flex justify-center"><AlertTriangle className="h-6 w-6" /></div>
          <div className="font-semibold">Unable to load this thread</div>
          <div className={isDark ? 'mt-2 text-sm text-red-300' : 'mt-2 text-sm text-red-600'}>{error}</div>
          <button type="button" onClick={onRetry} className={isDark ? 'mt-4 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-400' : 'mt-4 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500'}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className={`flex h-full items-center justify-center p-6 text-center ${shell}`}>
        <div>
          <div className={`text-xl font-semibold ${strong}`}>Select a conversation</div>
          <div className={`mt-2 text-sm ${soft}`}>Choose a thread to read the full email history.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${shell}`}>
      <div className={`border-b px-5 py-4 ${border}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[18px] font-semibold ${strong}`}>{thread.subject || 'No subject'}</h2>
            <div className={`mt-1 text-sm ${soft}`}>
              {thread.mailbox} · {messages.length} messages
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => {
          const metadata = parseMetadata(message.metadata);
          const isInbound = message.direction === 'inbound';
          const badgeStatus = message.status === 'failed' ? 'Failed' : message.status === 'sent' ? 'Sent' : 'Received';
          const badgeColor = message.status === 'failed'
            ? isDark ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
            : isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700';

          return (
            <div key={message.id} className={`overflow-hidden rounded-xl border ${card}`}>
              {isInbound ? (
                <div className="border-b border-slate-200/20 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9f7ea] text-[11px] font-semibold text-slate-800">
                        {(thread.contact_name || thread.contact_email || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${strong}`}>{thread.contact_name || 'Customer'}</div>
                        <div className={`text-[11px] ${soft}`}>{thread.contact_email || message.from_addr || 'Unknown sender'}</div>
                      </div>
                    </div>
                    <div className={`text-[11px] ${soft}`}>{formatMessageTime(message.created_at)}</div>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md ${isDark ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white'}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className={`text-sm font-semibold ${strong}`}>Agent reply</div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeColor}`}>{badgeStatus}</span>
                  </div>
                  <div className={`text-[11px] ${soft}`}>{formatMessageTime(message.created_at)}</div>
                </div>
              )}

              <div className="px-4 py-4">
                <div className={`whitespace-pre-wrap text-[14px] leading-7 ${isInbound ? (isDark ? 'text-slate-200' : 'text-slate-700') : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
                  {message.body_html ? (
                    <iframe
                      title={`message-${message.id}`}
                      sandbox=""
                      srcDoc={message.body_html}
                      className="min-h-[160px] w-full rounded-xl border bg-white"
                      style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}
                    />
                  ) : (
                    message.body_text || 'No message content.'
                  )}
                </div>

                {metadata ? (
                  <details className={`mt-4 rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`} open>
                    <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${soft}`}>
                      Consultation details
                      <ChevronDown className="h-3.5 w-3.5" />
                    </summary>
                    <div className={`mt-3 grid gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {Object.entries(metadata).map(([key, value]) => (
                        <div key={key} className={`flex justify-between gap-3 border-b pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                          <span className={soft}>{key.replace(/_/g, ' ')}</span>
                          <span className={`max-w-[70%] text-right ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`border-t px-5 py-3 text-center text-xs ${soft} ${border}`}>
        Read-only view of agent conversations
      </div>
    </div>
  );
}
