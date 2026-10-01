import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

function formatDetailedMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function stripHtml(value: string | null | undefined) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseMetadata(metadata: Record<string, any> | undefined) {
  if (!metadata || typeof metadata !== 'object') return null;

  const keys = ['consultation_date', 'consultation_time', 'company_name', 'use_case', 'google_meet_link', 'source'];
  const found = keys.filter((key) => metadata[key] !== undefined && metadata[key] !== null && metadata[key] !== '');
  if (!found.length) return null;

  return found.reduce<Record<string, string>>((acc, key) => {
    acc[key] = String(metadata[key]);
    return acc;
  }, {});
}

function parseFallbackWebsiteFields(bodyText: string) {
  const collected: Record<string, string> = {};
  const lines = bodyText.split(/\r?\n/);
  let currentKey: string | null = null;
  const buffer: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (currentKey && buffer.length) {
        collected[currentKey] = buffer.join('\n').trim();
      }
      currentKey = null;
      buffer.length = 0;
      continue;
    }

    const match = line.match(/^([A-Za-z][A-Za-z /-]*):\s*(.*)$/);
    if (match) {
      if (currentKey && buffer.length) {
        collected[currentKey] = buffer.join('\n').trim();
      }
      const key = match[1].trim();
      const value = match[2].trim();
      if (value) {
        collected[key] = value;
        currentKey = null;
        buffer.length = 0;
      } else {
        currentKey = key;
        buffer.length = 0;
      }
      continue;
    }

    if (currentKey) {
      buffer.push(line);
    }
  }

  if (currentKey && buffer.length) {
    collected[currentKey] = buffer.join('\n').trim();
  }

  return collected;
}

function getWebsiteFormRows(message: MessageItem, thread: ThreadDetails) {
  const metadata = message.metadata || {};
  const fallback = parseFallbackWebsiteFields(message.body_text || '');

  const rows: Array<{ label: string; value: string; preserveWrap?: boolean }> = [];
  const name = thread.contact_name || 'Unknown';
  const email = message.from_addr || fallback.Email || fallback['Email Address'] || '';
  const company = metadata.company_name || fallback.Company || fallback['Company'] || '';
  const workflow = metadata.primary_email_workflow || fallback['Primary email workflow'] || fallback['Primary email workflow:'] || '';
  const volume = metadata.monthly_email_volume || fallback['Monthly email volume'] || fallback['Monthly email volume:'] || '';
  const consultationDate = metadata.consultation_date || fallback['Consultation date'] || fallback['Consultation date:'] || '';
  const consultationTime = metadata.consultation_time || fallback['Consultation time'] || fallback['Consultation time:'] || '';
  const useCaseValue = metadata.use_case || fallback['Use case'] || fallback['Use case:'] || '';

  if (name) rows.push({ label: 'Name', value: name });
  if (email) rows.push({ label: 'Email', value: email });
  if (company) rows.push({ label: 'Company', value: company });
  if (workflow) rows.push({ label: 'Primary email workflow', value: workflow });
  if (volume) rows.push({ label: 'Monthly email volume', value: volume });
  const preferredSlot = [consultationDate, consultationTime].filter(Boolean).join(' ');
  if (preferredSlot) rows.push({ label: 'Preferred slot', value: preferredSlot });
  if (useCaseValue) rows.push({ label: 'Use case', value: useCaseValue, preserveWrap: true });

  return rows;
}

function getMessageChips(message: MessageItem, thread: ThreadDetails) {
  const isInbound = message.direction === 'inbound';
  const isWebsiteForm = message.metadata?.source === 'website_form';

  if (isInbound) {
    return [
      { label: 'Source', value: isWebsiteForm ? 'Website form' : 'Email' },
      { label: 'Status', value: 'Received' },
    ];
  }

  return [
    { label: 'Handled by', value: message.agent_name || 'General/Scheduling Agent' },
    { label: 'Status', value: message.status === 'failed' ? 'Failed' : 'Sent' },
  ];
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

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!orderedMessages.length) {
      setExpandedIds(new Set());
      return;
    }

    const lastMessageId = orderedMessages[orderedMessages.length - 1]?.id;
    setExpandedIds(new Set(lastMessageId ? [lastMessageId] : []));
  }, [orderedMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !orderedMessages.length) return;

    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  }, [thread?.id, orderedMessages.length, expandedIds]);

  const expandAll = () => setExpandedIds(new Set(orderedMessages.map((message) => message.id)));
  const collapseAll = () => setExpandedIds(new Set());

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
    <div className={`flex h-full min-h-0 flex-col ${shell}`}>
      <div className={`shrink-0 border-b px-5 py-4 ${border}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-[18px] font-semibold ${strong}`}>{thread.subject || 'No subject'}</h2>
            <div className={`mt-1 text-sm ${soft}`}>
              {thread.mailbox} · {orderedMessages.length} messages
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={expandAll} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
              Expand all
            </button>
            <button type="button" onClick={collapseAll} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
              Collapse all
            </button>
          </div>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-5">
        <div className="space-y-4">
          {orderedMessages.map((message, index) => {
            const isInbound = message.direction === 'inbound';
            const isExpanded = expandedIds.has(message.id);
            const isWebsiteForm = message.metadata?.source === 'website_form';
            const senderName = isInbound ? (thread.contact_name || thread.contact_email || 'Customer') : 'Hello Agent';
            const senderEmail = message.from_addr || (isInbound ? thread.contact_email : 'ai@helloagent.email') || 'unknown@example.com';
            const bodyText = message.body_text || stripHtml(message.body_html) || 'No message content.';
            const previewText = stripHtml(bodyText).slice(0, 120) + (stripHtml(bodyText).length > 120 ? '…' : '');
            const chips = getMessageChips(message, thread);
            const badgeTone = isInbound
              ? 'border-slate-200 bg-slate-100 text-slate-700'
              : message.status === 'failed'
                ? isDark ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
                : isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
            const initials = (senderName || 'A').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div key={message.id} className="relative pl-7">
                {index < orderedMessages.length - 1 ? (
                  <div className={`absolute left-[15px] top-0 h-full w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                ) : null}
                <div className={`absolute left-0 top-3 h-4 w-4 rounded-full border-2 ${isDark ? 'border-slate-900 bg-sky-500' : 'border-white bg-sky-600'}`} />

                <div className={`rounded-2xl border ${card}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedIds((current) => {
                      const next = new Set(current);
                      if (next.has(message.id)) {
                        next.delete(message.id);
                      } else {
                        next.add(message.id);
                      }
                      return next;
                    })}
                    aria-expanded={isExpanded}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ${isInbound ? (isDark ? 'bg-[#d9f7ea] text-slate-800' : 'bg-emerald-100 text-emerald-900') : (isDark ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white')}`}>
                          {initials}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${strong}`}>{senderName}</div>
                          <div className={`text-[11px] ${soft}`}>{senderEmail}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {chips.map((chip) => (
                              <span key={`${message.id}-${chip.label}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${chip.label === 'Status' ? badgeTone : (isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700')}`}>
                                <span className="opacity-70">{chip.label}:</span>
                                <span>{chip.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className={soft}>{formatMessageTime(message.created_at)}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {!isExpanded ? (
                    <div className={`border-t px-4 pb-3 pt-2 text-sm ${isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                      {previewText}
                    </div>
                  ) : (
                    <div className={`border-t px-4 py-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className={`mb-4 rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${soft}`}>
                          Message details
                        </div>
                        <div className={`grid gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <div className={`flex items-start justify-between gap-3 border-b pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <span className={soft}>From:</span>
                            <span className={`max-w-[70%] text-right ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                              {isInbound ? `${thread.contact_name || 'Customer'} ${message.from_addr || senderEmail}` : `Hello Agent ${message.from_addr || senderEmail}`}
                            </span>
                          </div>
                          <div className={`flex items-start justify-between gap-3 border-b pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <span className={soft}>To:</span>
                            <span className={`max-w-[70%] text-right ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{message.to_addr || 'Unknown recipient'}</span>
                          </div>
                          <div className={`flex items-start justify-between gap-3 border-b pb-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <span className={soft}>Subject:</span>
                            <span className={`max-w-[70%] text-right ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{message.subject || thread.subject || 'No subject'}</span>
                          </div>
                          <div className={`flex items-start justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                            <span className={soft}>Date:</span>
                            <span className={`max-w-[70%] text-right ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{formatDetailedMessageTime(message.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {isWebsiteForm ? (
                        <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                          <div className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] ${soft}`}>
                            Website form details
                          </div>
                          <div className="space-y-2 text-sm">
                            {getWebsiteFormRows(message, thread).map((row) => (
                              <div key={`${message.id}-${row.label}`} className="flex gap-3">
                                <div className={`w-[180px] shrink-0 text-xs font-medium ${soft}`}>{row.label}:</div>
                                <div className={`min-w-0 flex-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ whiteSpace: row.preserveWrap ? 'pre-wrap' : 'normal' }}>{row.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`leading-7 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ whiteSpace: 'pre-wrap' }}>
                          {bodyText}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`shrink-0 border-t px-5 py-3 text-center text-xs ${soft} ${border}`}>
        Read-only view of agent conversations
      </div>
    </div>
  );
}
