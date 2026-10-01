import { ChevronDown, Search, Sparkles, Tag, X } from 'lucide-react';
import type { EmailListItem, ThreadItem } from '../../services/mailboxApi';

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
  totalThreads: number;
  searchTerm: string;
  filter: 'all' | 'unread' | 'replied';
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
    if (filter === 'unread' && !unread) return false;
    if (filter === 'replied' && !isReplied) return false;
    if (agentFilter !== 'all' && (agent || '') !== agentFilter) return false;
    return true;
  });

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
    <div className={`flex h-full min-h-0 min-w-0 flex-col border-r ${shell}`}>
      <div className={`shrink-0 border-b px-4 py-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className={`text-[11px] font-medium uppercase tracking-[0.2em] ${muted}`}>Inbox</div>
            <div className={`text-[11px] font-medium ${muted}`}>•</div>
            <div className={`min-w-0 break-words text-[11px] font-medium ${strong}`}>{selectedMailboxLabel}</div>
          </div>
          <div className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${chip}`}>
            {totalThreads} {folder === 'all' ? (totalThreads === 1 ? 'conversation' : 'conversations') : (totalThreads === 1 ? 'email' : 'emails')}
          </div>
        </div>

        <div className="relative mt-4">
          <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={folder === 'all' ? 'Search conversations' : 'Search emails'}
            className={`w-full rounded-xl border py-2.5 pl-9 pr-10 text-sm outline-none focus:border-slate-400 ${field}`}
          />
          {!searchTerm ? (
            <div className={`absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${chip}`}>
              <span className="text-[10px] font-semibold">/</span>
            </div>
          ) : (
            <button type="button" onClick={() => onSearchChange('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted}`}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: `Unread ${unreadTotal}`, value: 'unread' },
              { label: `Agent replied ${repliedTotal}`, value: 'replied' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value as 'all' | 'unread' | 'replied')}
                className={`rounded-full border px-2.5 py-1.5 text-xs font-medium transition ${filter === option.value ? (isDark ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-300 bg-slate-900 text-white') : (isDark ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-500')}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={`relative`}> 
            <select
              value={agentFilter}
              onChange={(event) => onAgentFilterChange(event.target.value)}
              className={`appearance-none rounded-full border px-3 py-1.5 pr-8 text-xs font-medium outline-none ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}
            >
              <option value="all">All agents</option>
              {agentOptions.map((agent) => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
            <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${toggle}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`h-20 animate-pulse rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'}`} />
            ))}
          </div>
        ) : visibleThreads.length > 0 ? (
          <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
            {visibleThreads.map((item) => {
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

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectThread(id)}
                  className={`block w-full border-l-2 px-3 py-3 text-left transition ${isSelected ? `border-slate-900 ${rowSelected}` : `border-transparent ${rowHover}`}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: unread ? '#111827' : '#e5e7eb', color: unread ? '#f8fafc' : '#374151' }}>
                      {getContactInitial(displayName || 'A')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`truncate text-sm font-semibold ${unread ? strong : soft}`}>
                          {displayName}
                        </div>
                        <div className={`shrink-0 text-[10px] ${muted}`}>{formatRelativeTime(timestamp)}</div>
                      </div>

                      <div className={`mt-1 truncate text-[13px] ${unread ? strong : soft}`}>
                        {subject}
                      </div>

                      <div className={`mt-1 truncate text-xs ${muted}`}>{preview}</div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {unread ? <span className="h-2.5 w-2.5 rounded-full bg-slate-900" /> : null}
                        {chips.map((chipItem) => (
                          <span key={`${id}-${chipItem.label}`} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium ${badgeTone}`}>
                            <span className="opacity-70">{chipItem.label}:</span>
                            <span>{chipItem.value}</span>
                          </span>
                        ))}
                        <span className={`text-[10px] ${muted}`}>{mailbox}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <div className={`text-lg font-semibold ${strong}`}>{folder === 'all' ? 'No conversations yet' : 'No emails yet'}</div>
              <div className={`mt-2 text-sm ${muted}`}>Try a different inbox or search query.</div>
              {searchTerm || filter !== 'all' || agentFilter !== 'all' ? (
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
