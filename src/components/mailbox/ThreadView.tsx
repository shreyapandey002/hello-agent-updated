import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, FileText, PanelRightClose, PanelRightOpen, Paperclip } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

function buildWordBoundedPreview(value: string | null | undefined) {
  const compact = String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!compact) return '';

  const maxLength = 220;
  if (compact.length <= maxLength) return compact;

  const truncated = compact.slice(0, maxLength).trimEnd();
  const lastSpace = truncated.lastIndexOf(' ');
  const safeSlice = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated.slice(0, maxLength);

  return `${safeSlice.trimEnd()}…`;
}

type MessageViewTab = 'Rendered' | 'Text' | 'Headers';

function readMessageViewTab(): MessageViewTab {
  try {
    const value = window.localStorage.getItem('hello-agent-mailbox-message-tab');
    return value === 'Text' || value === 'Headers' ? value : 'Rendered';
  } catch {
    return 'Rendered';
  }
}

function getWebsiteFormRows(message: MessageItem, thread: ThreadDetails) {
  const metadata = message.metadata || {};
  const fallback: Record<string, string> = {};
  (message.body_text || '').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) fallback[match[1].trim().toLowerCase()] = match[2].trim();
  });

  const rows: Array<[string, string]> = [
    ['Name', thread.contact_name || fallback.name || ''],
    ['Email', message.from_addr || fallback.email || ''],
    ['Company', String(metadata.company_name || fallback.company || '')],
    ['Primary email workflow', String(metadata.primary_email_workflow || fallback['primary email workflow'] || '')],
    ['Monthly email volume', String(metadata.monthly_email_volume || fallback['monthly email volume'] || '')],
    ['Preferred slot', [metadata.consultation_date || fallback['consultation date'], metadata.consultation_time || fallback['consultation time']].filter(Boolean).join(' ')],
  ];

  return {
    rows: rows.filter(([, value]) => Boolean(value)),
    useCase: String(metadata.use_case || fallback['use case'] || ''),
  };
}

function renderEmailHtml(html: string, isDark: boolean) {
  const color = isDark ? '#e2e8f0' : '#334155';
  const baseStyles = `<style>html,body{margin:0;padding:0;background:transparent!important;color:${color}!important;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-size:14px!important;line-height:1.6!important}body{padding:8px}img{max-width:100%;height:auto}</style>`;
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (head) => `${head}${baseStyles}`);
  }
  return `<!doctype html><html><head>${baseStyles}</head><body>${html}</body></html>`;
}

function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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

function readDetailsVisibility() {
  try {
    return window.localStorage.getItem('hello-agent-mailbox-details-open') !== 'false';
  } catch {
    return true;
  }
}

export function ThreadView({
  thread,
  messages,
  loading,
  error,
  folder,
  onRetry,
  onBack,
  onNavigateThread,
  canNavigatePrevious,
  canNavigateNext,
  previousThreadId,
  nextThreadId,
  isDark,
}: {
  thread: ThreadDetails | null;
  messages: MessageItem[];
  loading: boolean;
  error: string;
  folder: 'all' | 'incoming' | 'sent';
  onRetry: () => void;
  onBack: () => void;
  onNavigateThread: (id: number) => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  previousThreadId?: number;
  nextThreadId?: number;
  isDark: boolean;
}) {
  const shell = isDark ? 'bg-[#111827] text-slate-100' : 'bg-[#f7f7f5] text-slate-900';
  const border = isDark ? 'border-slate-800' : 'border-slate-200';
  const soft = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-slate-100' : 'text-slate-900';
  const card = isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white';
  const isIndividualEmail = folder !== 'all';

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [recipientExpandedIds, setRecipientExpandedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<MessageViewTab>(readMessageViewTab);
  const [detailsOpen, setDetailsOpen] = useState(readDetailsVisibility);
  const [copiedField, setCopiedField] = useState('');
  const orderedMessageIds = orderedMessages.map((message) => message.id).join(',');

  const getCompactWebsiteSummary = (message: MessageItem) => {
    const metadata = message.metadata || {};
    const company = metadata.company_name || '';
    const workflow = metadata.primary_email_workflow || metadata.use_case || '';
    const volume = metadata.monthly_email_volume || '';
    const date = metadata.consultation_date || '';
    const time = metadata.consultation_time || '';

    const values = [
      company ? `Company: ${company}` : '',
      workflow ? `Workflow: ${workflow}` : '',
      volume ? `Volume: ${volume}` : '',
      date || time ? `Slot: ${[date, time].filter(Boolean).join(' ')}` : '',
    ].filter(Boolean);

    return values.join(' · ');
  };

  useEffect(() => {
    if (!orderedMessages.length) {
      setExpandedIds(new Set());
      return;
    }

    const lastMessageId = orderedMessages[orderedMessages.length - 1]?.id;
    setExpandedIds(new Set(lastMessageId ? [lastMessageId] : []));
  }, [thread?.id, orderedMessageIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem('hello-agent-mailbox-details-open', String(detailsOpen));
    } catch {
      // ignore storage access issues
    }
  }, [detailsOpen]);

  useEffect(() => {
    try {
      window.localStorage.setItem('hello-agent-mailbox-message-tab', activeTab);
    } catch {
      // ignore storage access issues
    }
  }, [activeTab]);

  const detailMessage = [...orderedMessages].reverse().find((message) => expandedIds.has(message.id)) || orderedMessages[orderedMessages.length - 1];
  const copyDetailValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = value;
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    setCopiedField(key);
    window.setTimeout(() => setCopiedField(''), 1200);
  };

  const expandAll = () => setExpandedIds(new Set(orderedMessages.map((message) => message.id)));
  const collapseAll = () => setExpandedIds(new Set());

  if (loading) {
    return (
      <div className={`flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-6 ${shell}`}>
        <div className={`space-y-4 text-center ${soft}`}>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <div>Loading conversation…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-6 ${shell}`}>
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
      <div className={`flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-6 text-center ${shell}`}>
        <div>
          <div className={`text-xl font-semibold ${strong}`}>Select a conversation</div>
          <div className={`mt-2 text-sm ${soft}`}>Choose a thread to read the full email history.</div>
        </div>
      </div>
    );
  }

  const detailSourceAction = `${detailMessage?.metadata?.source || ''} ${detailMessage?.metadata?.action || ''}`.toLowerCase();
  const detailLabels = [
    detailSourceAction.includes('resched') ? 'reschedule' : '',
    detailSourceAction.includes('treaty') ? 'treaty-review' : '',
    detailSourceAction.includes('booking') || detailSourceAction.includes('consultation') || detailSourceAction.includes('website_form') ? 'booking' : '',
    detailSourceAction.includes('reply') ? 'customer-reply' : '',
    detailSourceAction.includes('general') || detailSourceAction.includes('info') ? 'general-info' : '',
  ].filter(Boolean);

  return (
    <div className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden ${shell}`}>
      <div className={`min-w-0 shrink-0 border-b px-3 py-2 ${border}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button type="button" onClick={onBack} title="Back to inbox" aria-label="Back to inbox" className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 truncate text-sm font-semibold" title={orderedMessages[0]?.subject || thread.subject || 'No subject'}>{orderedMessages[0]?.subject || thread.subject || 'No subject'}</div>
          <div className={`flex shrink-0 items-center rounded-full border p-0.5 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-100'}`} role="tablist" aria-label="Message view">
            {(['Rendered', 'Text', 'Headers'] as const).map((tab) => (
              <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${activeTab === tab ? (isDark ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white shadow-sm') : soft}`}>{tab}</button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" disabled={!canNavigatePrevious} onClick={() => previousThreadId && onNavigateThread(previousThreadId)} title="Previous thread" aria-label="Previous thread" className={`inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" disabled={!canNavigateNext} onClick={() => nextThreadId && onNavigateThread(nextThreadId)} title="Next thread" aria-label="Next thread" className={`inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}><ChevronRight className="h-4 w-4" /></button>
          </div>
          <button type="button" onClick={() => setDetailsOpen((value) => !value)} title={detailsOpen ? 'Hide details' : 'Show details'} aria-label={detailsOpen ? 'Hide details' : 'Show details'} className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
            {detailsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
          <div className={`truncate text-[11px] ${soft}`} title={thread.mailbox}>{thread.mailbox} · {folder === 'all' ? `${orderedMessages.length} messages` : 'Individual email'}</div>
          {folder === 'all' ? <div className="flex shrink-0 gap-1"><button type="button" onClick={expandAll} className={`rounded px-2 py-1 text-[10px] ${soft}`}>Expand all</button><button type="button" onClick={collapseAll} className={`rounded px-2 py-1 text-[10px] ${soft}`}>Collapse all</button></div> : null}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className={`${isIndividualEmail ? 'min-h-0 min-w-0 flex-1 overflow-hidden p-5' : 'mr-2 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-5'} thin-scrollbar`}>
        <div className={isIndividualEmail ? 'flex h-full min-h-0 min-w-0 flex-col' : 'space-y-3'}>
          {orderedMessages.map((message, index) => {
            const isInbound = message.direction === 'inbound';
            const isExpanded = expandedIds.has(message.id);
            const isWebsiteForm = message.metadata?.source === 'website_form';
            const senderName = isInbound ? (thread.contact_name || thread.contact_email || 'Customer') : 'Hello Agent';
            const senderEmail = message.from_addr || (isInbound ? thread.contact_email : 'ai@helloagent.email') || 'unknown@example.com';
            const bodyText = message.body_text || stripHtml(message.body_html) || 'No message content.';
            const strippedBodyText = stripHtml(bodyText);
            const previewText = buildWordBoundedPreview(strippedBodyText);
            const compactWebsiteSummary = isWebsiteForm ? getCompactWebsiteSummary(message) : '';
            const websiteForm = isWebsiteForm ? getWebsiteFormRows(message, thread) : null;
            const chips = getMessageChips(message, thread);
            const badgeTone = isInbound
              ? 'border-slate-200 bg-slate-100 text-slate-700'
              : message.status === 'failed'
                ? isDark ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
                : isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
            const initials = (senderName || 'A').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

            return (
              <div key={message.id} className={isIndividualEmail ? 'flex min-h-0 min-w-0 flex-1 flex-col' : 'relative min-w-0 pl-7'}>
                {!isIndividualEmail && index < orderedMessages.length - 1 ? (
                  <div className={`absolute left-[15px] top-0 h-full w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                ) : null}
                {!isIndividualEmail ? (
                  <div className={`absolute left-0 top-3 h-4 w-4 rounded-full border-2 ${isDark ? 'border-slate-900 bg-sky-500' : 'border-white bg-sky-600'}`} />
                ) : null}

                <div className={`${isIndividualEmail ? 'flex min-h-0 min-w-0 flex-1 flex-col ' : 'min-w-0 '}overflow-hidden rounded-lg border ${card}`}>
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
                    className="w-full shrink-0 text-left"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ${isInbound ? (isDark ? 'bg-[#d9f7ea] text-slate-800' : 'bg-emerald-100 text-emerald-900') : (isDark ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white')}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`break-words text-sm font-semibold [overflow-wrap:anywhere] ${strong}`}>{senderName} <span className={`text-[11px] font-normal ${soft}`}>&lt;{senderEmail}&gt;</span></div>
                          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                            {chips.map((chip) => (
                              <span key={`${message.id}-${chip.label}`} className={`inline-flex min-w-0 max-w-full flex-wrap items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${chip.label === 'Status' ? badgeTone : (isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700')}`}>
                                <span className="opacity-70">{chip.label}:</span>
                                <span className="break-words [overflow-wrap:anywhere]">{chip.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-[11px] text-slate-500">
                        <span className={soft}>{formatMessageTime(message.created_at)}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  <div className={`border-t px-4 py-1.5 text-[11px] ${border}`}>
                    <button type="button" onClick={() => setRecipientExpandedIds((current) => {
                      const next = new Set(current);
                      if (next.has(message.id)) next.delete(message.id);
                      else next.add(message.id);
                      return next;
                    })} className={`flex max-w-full items-center gap-1 text-left ${soft}`} aria-expanded={recipientExpandedIds.has(message.id)}>
                      <span className={recipientExpandedIds.has(message.id) ? 'break-all' : 'truncate'} title={message.to_addr || 'Unknown recipient'}>to {message.to_addr || 'Unknown recipient'}</span>
                      <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${recipientExpandedIds.has(message.id) ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {!isExpanded ? (
                    <div className={`border-t px-4 pb-3 pt-2 text-sm ${isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                      {isWebsiteForm ? (
                        <p className="break-words leading-snug [overflow-wrap:anywhere]">
                          {compactWebsiteSummary || previewText}
                        </p>
                      ) : (
                        <p className="break-words leading-snug [overflow-wrap:anywhere]">
                          {previewText}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className={`${isIndividualEmail ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ' : ''}border-t px-4 py-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className={`${isIndividualEmail ? '-ml-4 -mr-2 -mb-4 min-h-0 flex-1 overflow-y-auto overscroll-y-contain thin-scrollbar' : ''} min-w-0 overflow-x-hidden`}>
                        <div className="min-w-0">
                          {activeTab === 'Text' ? (
                            <pre className={`whitespace-pre-wrap break-words rounded-md p-4 font-mono text-[13px] leading-[1.6] [overflow-wrap:anywhere] ${isDark ? 'bg-slate-950/60 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>{bodyText}</pre>
                          ) : activeTab === 'Headers' ? (
                            <div className="space-y-3">
                              <dl className={`overflow-hidden rounded-md border text-sm ${isDark ? 'border-slate-700 divide-slate-800' : 'border-slate-200 divide-slate-100'}`}>
                                {[
                                  ['Message ID', message.provider_email_id || '—'],
                                  ['Direction', message.direction],
                                  ['Status', message.status || '—'],
                                  ['From', message.from_addr || '—'],
                                  ['To', message.to_addr || '—'],
                                  ['Subject', message.subject || thread.subject || '—'],
                                  ['Date', Number.isNaN(new Date(message.created_at).getTime()) ? message.created_at : new Date(message.created_at).toISOString()],
                                  ['Agent', message.agent_name || '—'],
                                  ['Source', String(message.metadata?.source || '—')],
                                ].map(([label, value]) => {
                                  const copyKey = `${message.id}-${label}`;
                                  return (
                                    <div key={label} className={`group grid grid-cols-[minmax(6rem,0.35fr)_minmax(0,1fr)_1.5rem] items-center gap-3 border-b px-3 py-2 last:border-b-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                      <dt className={`text-[12px] ${soft}`}>{label}</dt>
                                      <dd className={`min-w-0 break-words text-[13px] ${strong}`}>{value || '—'}</dd>
                                      <button type="button" onClick={() => void copyDetailValue(copyKey, value || '—')} aria-label={`Copy ${label}`} title={copiedField === copyKey ? 'Copied' : `Copy ${label}`} className={`inline-flex h-6 w-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                                        {copiedField === copyKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                  );
                                })}
                              </dl>
                              <details className={`rounded-md border ${isDark ? 'border-slate-700 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                                <summary className={`cursor-pointer px-3 py-2 text-xs font-medium ${soft}`}>Metadata JSON</summary>
                                <pre className={`overflow-x-auto whitespace-pre-wrap break-words border-t p-3 font-mono text-[11px] leading-5 ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-700'}`}>{JSON.stringify(message.metadata || {}, null, 2)}</pre>
                              </details>
                            </div>
                          ) : websiteForm ? (
                            <div className={`rounded-md border p-4 ${isDark ? 'border-slate-700 bg-slate-950/40' : 'border-slate-200 bg-white'}`}>
                              <div className="grid grid-cols-[minmax(7rem,0.35fr)_minmax(0,1fr)] gap-x-4 gap-y-2.5">
                                {websiteForm.rows.map(([label, value]) => (
                                  <div key={label} className="contents">
                                    <div className={`text-[13px] ${soft}`}>{label}</div>
                                    <div className={`min-w-0 break-words text-sm font-normal [overflow-wrap:anywhere] ${strong}`}>{value}</div>
                                  </div>
                                ))}
                              </div>
                              {websiteForm.useCase ? <div className={`mt-3 border-t pt-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}><div className={`mb-1 text-[13px] ${soft}`}>Use case</div><div className={`whitespace-pre-wrap break-words text-sm font-normal leading-[1.6] [overflow-wrap:anywhere] ${strong}`}>{websiteForm.useCase}</div></div> : null}
                            </div>
                          ) : message.body_html ? (
                            <iframe
                              title="Rendered email content"
                              sandbox="allow-same-origin"
                              srcDoc={renderEmailHtml(message.body_html, isDark)}
                              onLoad={(event) => {
                                const iframe = event.currentTarget;
                                const document = iframe.contentDocument;
                                if (document) {
                                  const bodyHeight = document.body?.scrollHeight || 0;
                                  const overflowingRootHeight = document.documentElement.scrollHeight > iframe.clientHeight
                                    ? document.documentElement.scrollHeight
                                    : 0;
                                  iframe.style.height = `${Math.max(180, bodyHeight, overflowingRootHeight)}px`;
                                }
                              }}
                              className="min-h-[180px] w-full border-0 bg-transparent"
                              style={{ height: 240 }}
                            />
                          ) : (
                            <div className={`min-w-0 whitespace-pre-wrap break-words text-sm leading-[1.6] [overflow-wrap:anywhere] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {bodyText}
                            </div>
                          )}

                          {activeTab === 'Rendered' && message.metadata.attachments?.length ? (
                            <div className="mt-4 space-y-2">
                              <div className={`flex items-center gap-2 text-xs font-semibold ${soft}`}>
                                <Paperclip className="h-3.5 w-3.5" />
                                Attachments ({message.metadata.attachments.length})
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {message.metadata.attachments.map((attachment) => {
                                  const emailId = message.provider_email_id || message.metadata.email_id;
                                  const attachmentUrl = emailId
                                    ? `/api/attachment?${new URLSearchParams({
                                        email_id: emailId,
                                        attachment_id: attachment.id,
                                      }).toString()}`
                                    : undefined;
                                  const fileType = attachment.content_type.split('/').pop()?.toUpperCase() || 'FILE';

                                  return (
                                    <a
                                      key={attachment.id}
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      aria-disabled={!attachmentUrl}
                                      onClick={!attachmentUrl ? (event) => event.preventDefault() : undefined}
                                      className={`flex min-w-0 max-w-full items-center gap-3 rounded-md border px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-950/60 hover:bg-slate-800' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} ${!attachmentUrl ? 'cursor-not-allowed opacity-60' : ''}`}
                                    >
                                      <FileText className={`h-5 w-5 shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-500'}`} />
                                      <span className="min-w-0">
                                        <span className={`block break-all text-xs font-medium ${strong}`}>{attachment.filename}</span>
                                        <span className={`mt-0.5 block text-[10px] ${soft}`}>
                                          {fileType} · {formatAttachmentSize(attachment.size)}
                                        </span>
                                      </span>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detailsOpen ? (
        <aside className={`mailbox-details-panel hidden min-h-0 w-[300px] shrink-0 flex-col overflow-y-auto border-l px-4 py-4 min-[1280px]:flex ${border} ${isDark ? 'bg-[#111827]' : 'bg-white'}`} aria-label="Message details">
          {detailMessage ? <>
            <section className={`border-b pb-4 ${border}`}>
              <h3 className={`mb-3 text-xs font-semibold ${strong}`}>Message</h3>
              <div className="mb-3 flex items-center gap-2">
                {detailMessage.status === 'failed' ? <AlertTriangle className="h-4 w-4 text-red-500" /> : detailMessage.direction === 'inbound' ? <ArrowDownLeft className="h-4 w-4 text-emerald-500" /> : <ArrowUpRight className="h-4 w-4 text-blue-500" />}
                <span className={`text-xs font-medium ${detailMessage.status === 'failed' ? 'text-red-500' : detailMessage.direction === 'inbound' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {detailMessage.status === 'failed' ? 'Failed' : detailMessage.direction === 'inbound' ? 'Received' : 'Sent'}
                </span>
              </div>
              <dl className="space-y-2 text-[11px]">
                <div><dt className={soft}>From</dt><dd className={`mt-0.5 break-all ${strong}`}>{detailMessage.from_addr || 'Unknown sender'}</dd></div>
                <div><dt className={soft}>To</dt><dd className={`mt-0.5 break-all ${strong}`}>{detailMessage.to_addr || 'Unknown recipient'}</dd></div>
                <div><dt className={soft}>At</dt><dd className={`mt-0.5 ${strong}`}>{formatDetailedMessageTime(detailMessage.created_at)}</dd></div>
              </dl>
            </section>
            <section className={`border-b py-4 ${border}`}>
              <h3 className={`mb-3 text-xs font-semibold ${strong}`}>Handled by</h3>
              <div className={`text-xs ${strong}`}>{detailMessage.direction === 'inbound' ? 'Customer' : (detailMessage.agent_name || 'Hello Agent')}</div>
              <div className={`mt-1 text-[11px] ${soft}`}>{detailMessage.metadata?.source === 'website_form' ? 'Website form' : 'Email'}</div>
            </section>
            <section className={`border-b py-4 ${border}`}>
              <h3 className={`mb-3 text-xs font-semibold ${strong}`}>Identifiers</h3>
              {[
                ['Msg', detailMessage.provider_email_id || detailMessage.metadata?.email_id || '—'],
                ['Thread', String(thread.id)],
              ].map(([label, value]) => (
                <div key={label} className="mb-3 last:mb-0">
                  <div className={`text-[10px] ${soft}`}>{label}</div>
                  <div className="mt-1 flex min-w-0 items-center gap-1">
                    <span className={`min-w-0 flex-1 truncate font-mono text-[10px] ${strong}`} title={value}>{value}</span>
                    <button type="button" onClick={() => void copyDetailValue(label, value)} aria-label={`Copy ${label}`} title={copiedField === label ? 'Copied' : `Copy ${label}`} className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {copiedField === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </section>
            <section className="py-4">
              <h3 className={`mb-3 text-xs font-semibold ${strong}`}>Labels</h3>
              <div className="flex flex-wrap gap-1.5">
                {detailLabels.length ? detailLabels.map((label) => <span key={label} className={`rounded border px-2 py-1 text-[10px] ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{label}</span>) : <span className={`text-[11px] ${soft}`}>No labels</span>}
              </div>
            </section>
          </> : null}
        </aside>
      ) : null}
      </div>

      <div className={`shrink-0 border-t px-5 py-3 text-center text-xs ${soft} ${border}`}>
        {folder === 'all' ? 'Read-only view of agent conversations' : 'Read-only view of this email'}
      </div>
    </div>
  );
}
