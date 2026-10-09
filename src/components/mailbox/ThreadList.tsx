import { ArrowDownLeft, ArrowUpRight, ChevronDown, RefreshCw } from 'lucide-react';
import type { EmailListItem, ThreadFilter, ThreadItem } from '../../services/mailboxApi';

function formatRelativeTime(value: string | null) {
  if (!value) return 'just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'just now';

  const now = new Date();
  const diffMinutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getContactInitial(source: string | null | undefined = 'A') {
  return source.charAt(0).toUpperCase();
}

function getDateGroup(value: string | null) {
  if (!value) return 'Older';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Older';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((today.getTime() - dateDay.getTime()) / 86400000);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dateDay >= weekStart && dateDay < today) return 'Earlier this week';
  return 'Older';
}

export function ThreadList({
  threads,
  folder,
  selectedThreadId,
  selectedMailboxLabel,
  totalThreads,
  searchTerm,
  filter,
  agentFilter,
  agentOptions,
  onSearchChange,
  onFilterChange,
  onAgentFilterChange,
  onSelectThread,
  onRetry,
  loading,
  isDark,
}: {
  threads: Array<ThreadItem | EmailListItem>;
  folder: 'all' | 'incoming' | 'sent';
  selectedThreadId: number | null;
  selectedMailboxLabel: string;
  totalThreads?: number;
  searchTerm: string;
  filter: ThreadFilter;
  agentFilter: string;
  agentOptions: string[];
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'unread' | 'replied') => void;
  onAgentFilterChange: (value: string) => void;
  onSelectThread: (id: number) => void;
  onRetry: () => void;
  loading: boolean;
  isDark: boolean;
}) {
  const isEmail = (item: ThreadItem | EmailListItem): item is EmailListItem => 'thread_id' in item;
  const unreadTotal = threads.filter((item) => isEmail(item) ? item.thread_unread : item.unread).length;
  const repliedTotal = threads.filter((item) => isEmail(item)
    ? item.direction === 'outbound' && item.status !== 'failed'
    : item.last_direction === 'outbound' && item.last_status !== 'failed').length;

  const visibleThreads = threads.filter((item) => {
    const unread = isEmail(item) ? item.thread_unread : item.unread;
    const isReplied = isEmail(item)
      ? item.direction === 'outbound' && item.status !== 'failed'
      : item.last_direction === 'outbound' && item.last_status !== 'failed';
    const agent = isEmail(item) ? item.agent_name : item.last_agent;
    if (filter === 'unread' && !unread && item.id !== selectedThreadId) return false;
    if (filter === 'replied' && !isReplied) return false;
    if (agentFilter !== 'all' && (agent || '') !== agentFilter) return false;
    return true;
  });
  const counterTotal = totalThreads ?? threads.length;
  const groupedThreads = visibleThreads.reduce<Array<{ label: string; items: Array<ThreadItem | EmailListItem> }>>((groups, item) => {
    const date = isEmail(item) ? item.created_at : item.last_message_at;
    const label = getDateGroup(date);
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.items.push(item);
    else groups.push({ label, items: [item] });
    return groups;
  }, []);

  const shell = isDark ? 'border-slate-800 bg-[#111827]' : 'border-slate-200 bg-[#f7f7f5]';
  const panel = isDark ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-slate-100' : 'text-slate-900';
  const soft = isDark ? 'text-slate-300' : 'text-slate-600';
  const rowSelected = isDark ? 'bg-slate-800/90' : 'bg-slate-100';
  const rowHover = isDark ? 'hover:bg-slate-900/80' : 'hover:bg-slate-50';
  const field = isDark ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400';
  const chip = isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200';
  const toggle = isDark ? 'text-slate-300' : 'text-slate-600';
  const actionChip = isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700';
  const badgeSuccess = isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  const badgeNeutral = isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700';
  const badgeDanger = isDark ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700';

  const getThreadListChips = (thread: ThreadItem) => {
    const isInbound = thread.last_direction !== 'outbound';
    const websiteFormLike = thread.subject.toLowerCase().includes('consultation request') || thread.preview.toLowerCase().includes('preferred slot');

    if (isInbound) {
      return [
        { label: 'Source', value: websiteFormLike ? 'Website form' : 'Email' },
        { label: 'Status', value: 'Received' },
      ];
    }

    return [
      { label: 'Handled by', value: thread.last_agent || 'General/Scheduling Agent' },
      { label: 'Status', value: thread.last_status === 'failed' ? 'Failed' : 'Sent' },
    ];
  };

  return (
    <div className={`flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden ${shell}`}>
      <div className={`mailbox-toolbar shrink-0 border-b px-3 py-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="mailbox-filter-row flex min-w-0 items-center">
          <div className={`mailbox-filter-group flex min-w-0 flex-1 flex-nowrap overflow-hidden rounded-md border p-0.5 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`} role="group" aria-label="Filter conversations">
            {[
              { label: 'All', shortLabel: 'All', value: 'all' },
              { label: `Unread ${unreadTotal}`, shortLabel: 'Unread', value: 'unread' },
              { label: `Agent replied ${repliedTotal}`, shortLabel: 'Replied', value: 'replied' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value as 'all' | 'unread' | 'replied')}
                aria-pressed={filter === option.value}
                className={`mailbox-filter-option min-w-0 flex-1 truncate rounded px-2 py-1 text-center text-[11px] font-medium transition-colors ${filter === option.value ? (isDark ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white') : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-600 hover:bg-white hover:text-slate-900')}`}
              >
                <span className="mailbox-filter-label-full">{option.label}</span>
                <span className="mailbox-filter-label-short">{option.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <select
              value={agentFilter}
              onChange={(event) => onAgentFilterChange(event.target.value)}
              aria-label="Filter by agent"
              className={`w-full min-w-0 appearance-none truncate rounded-md border px-2 py-1.5 pr-7 text-[11px] font-medium outline-none ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}
            >
              <option value="all">All agents</option>
              {agentOptions.map((agent) => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
            <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${toggle}`} />
          </div>
          <button
            type="button"
            onClick={onRetry}
            title="Refresh"
            aria-label="Refresh"
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <div className={`shrink-0 whitespace-nowrap text-right text-[10px] ${muted}`}>
            {visibleThreads.length ? `1–${visibleThreads.length} of ${counterTotal}` : `0 of ${counterTotal}`}
          </div>
        </div>
      </div>

      <div className="thin-scrollbar mailbox-list-container min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`h-20 animate-pulse rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`} />
            ))}
          </div>
        ) : visibleThreads.length > 0 ? (
          <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
            {groupedThreads.map((group) => (
              <section key={group.label}>
                <div className={`sticky top-0 z-10 border-b px-4 py-1.5 text-[10px] font-medium ${isDark ? 'border-slate-800 bg-slate-900/95 text-slate-500' : 'border-slate-100 bg-white/95 text-slate-500'}`}>{group.label}</div>
                {group.items.map((item) => {
              const email = isEmail(item) ? item : null;
              const conversation = email ? null : item as ThreadItem;
              const id = item.id;
              const isSelected = id === selectedThreadId;
              const unread = email?.thread_unread ?? conversation?.unread ?? false;
              const direction = email?.direction ?? conversation?.last_direction;
              const status = email ? email.status : conversation?.last_status;
              const agent = email ? email.agent_name : conversation?.last_agent;
              const displayName = email
                ? folder === 'sent'
                  ? (email.to_addr || email.contact_name || email.contact_email || 'Unknown recipient')
                  : (email.from_addr || email.contact_name || email.contact_email || 'Unknown sender')
                : (conversation?.contact_name || conversation?.contact_email || 'Unknown contact');
              const subject = email?.subject || conversation?.subject || 'No subject';
              const preview = email?.preview || conversation?.preview || 'No preview available.';
              const timestamp = email?.created_at || conversation?.last_message_at;
              const mailbox = email?.mailbox || conversation?.mailbox || '';
              const needsAttention = Boolean(conversation?.needs_attention);
              const chips = email
                ? [
                    ...(folder === 'sent' && agent ? [{ label: 'Agent', value: agent }] : []),
                    { label: 'Status', value: status || (folder === 'incoming' ? 'Received' : 'Sent') },
                  ]
                : getThreadListChips(conversation!);
              const badgeTone = status === 'failed'
                ? badgeDanger
                : direction === 'outbound' && status !== 'failed'
                  ? badgeSuccess
                  : badgeNeutral;

              const displayDate = timestamp ? new Date(timestamp) : null;
              const shortTime = displayDate && !Number.isNaN(displayDate.getTime())
                ? displayDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
                : '';

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectThread(id)}
                  className={`mailbox-thread-row block w-full min-w-0 border-l-2 px-3 py-2 text-left box-border transition ${isSelected ? `border-slate-900 ${rowSelected}` : `border-transparent ${rowHover}`}`}
                >
                  <div className="mailbox-row-content min-w-0">
                    <span className={`mailbox-unread-dot ${unread ? 'is-unread' : ''}`} aria-label={unread ? 'Unread' : undefined} />
                    <span className={`mailbox-direction ${muted}`} aria-label={direction === 'outbound' ? 'Sent' : 'Received'}>
                      {direction === 'outbound' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                    </span>
                    <span className={`mailbox-sender truncate text-sm ${unread ? `font-semibold ${strong}` : soft}`}>{displayName}</span>
                    <span className="mailbox-subject-preview min-w-0 truncate text-[12px]">
                      <strong className={unread ? strong : soft}>{subject}</strong>
                      <span className={`mailbox-preview ${muted}`}> — {preview}</span>
                    </span>
                    <span className="mailbox-row-chips flex min-w-0 items-center gap-1">
                      {chips.slice(0, 2).map((chipItem) => (
                        <span key={`${id}-${chipItem.label}`} title={`${chipItem.label}: ${chipItem.value}`} className={`inline-flex max-w-28 truncate items-center rounded border px-1.5 py-0.5 text-[9px] font-medium ${badgeTone}`}>
                          {chipItem.value}
                        </span>
                      ))}
                      {needsAttention ? <span title="Needs attention" className={`inline-flex max-w-28 truncate items-center rounded border px-1.5 py-0.5 text-[9px] font-medium ${isDark ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>Needs attention</span> : null}
                    </span>
                    <span className={`mailbox-time whitespace-nowrap text-right text-[10px] ${muted}`} title={timestamp ? new Date(timestamp).toLocaleString() : ''}>{shortTime || formatRelativeTime(timestamp)}</span>
                    <div className="mailbox-stacked-content min-w-0">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className={`min-w-0 truncate text-sm ${unread ? `font-semibold ${strong}` : soft}`}>{displayName}</div>
                        <div className={`shrink-0 whitespace-nowrap text-[10px] ${muted}`}>{formatRelativeTime(timestamp)}</div>
                      </div>
                      <div className={`mt-1 truncate text-[13px] ${unread ? strong : soft}`}><strong>{subject}</strong><span className={muted}> — {preview}</span></div>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
                        {chips.slice(0, 2).map((chipItem) => <span key={`${id}-${chipItem.label}`} className={`inline-flex max-w-full truncate items-center rounded border px-1.5 py-0.5 text-[9px] font-medium ${badgeTone}`}>{chipItem.value}</span>)}
                        {needsAttention ? <span className={`inline-flex max-w-full truncate items-center rounded border px-1.5 py-0.5 text-[9px] font-medium ${isDark ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>Needs attention</span> : null}
                        <span className={`max-w-full truncate text-[9px] ${muted}`}>{mailbox}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
                })}
              </section>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <div className={`text-lg font-semibold ${strong}`}>{filter === 'needs_attention' ? 'All clear' : folder === 'all' ? 'No conversations yet' : 'No emails yet'}</div>
              <div className={`mt-2 text-sm ${muted}`}>{filter === 'needs_attention' ? 'No failed or unhandled emails in this inbox.' : 'Try a different inbox or search query.'}</div>
              {filter !== 'needs_attention' && (searchTerm || filter !== 'all' || agentFilter !== 'all') ? (
                <button type="button" onClick={() => { onSearchChange(''); onFilterChange('all'); onAgentFilterChange('all'); }} className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700">
                  Reset filters
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {!loading && visibleThreads.length === 0 ? (
        <div className={`border-t px-3 py-2 text-center text-xs ${muted}`}>
          {searchTerm || filter !== 'all' || agentFilter !== 'all' ? 'No matches found' : folder === 'all' ? 'No conversations available' : 'No emails available'}
        </div>
      ) : null}
    </div>
  );
}
