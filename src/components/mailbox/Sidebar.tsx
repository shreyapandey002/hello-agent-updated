import { ChevronDown, Inbox, Mail, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sparkles, SunMedium } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { User } from '../../context/AuthContext';
import type { Mailbox as MailboxType } from '../../services/mailboxApi';

function readStoredExpandedGroups(selectedMailbox: string, mailboxes: MailboxType[]) {
  const defaultExpanded: Record<string, boolean> = {
    all: selectedMailbox === 'all',
  };

  mailboxes.forEach((mailbox) => {
    defaultExpanded[mailbox.address] = selectedMailbox === mailbox.address;
  });

  try {
    const rawValue = window.localStorage.getItem('hello-agent-mailbox-expanded-groups');
    if (!rawValue) return defaultExpanded;
    const parsed = JSON.parse(rawValue) as Record<string, boolean> | null;
    if (!parsed || typeof parsed !== 'object') return defaultExpanded;

    return { ...defaultExpanded, ...parsed };
  } catch {
    return defaultExpanded;
  }
}

export function Sidebar({
  mailboxes,
  selectedMailbox,
  unreadTotal,
  user,
  onSelectMailbox,
  onSelectFolder,
  selectedFolder,
  allInboxCounts,
  onToggleTheme,
  onLogout,
  isDark,
  isCollapsed,
  onToggleCollapse,
}: {
  mailboxes: MailboxType[];
  selectedMailbox: string;
  unreadTotal: number;
  user: User | null;
  onSelectMailbox: (address: string) => void;
  onSelectFolder: (folder: 'all' | 'incoming' | 'sent', mailbox: string) => void;
  selectedFolder: 'all' | 'incoming' | 'sent';
  allInboxCounts: { incoming_count: number; sent_count: number; total_count: number };
  onToggleTheme: () => void;
  onLogout: () => void;
  isDark: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const shell = isDark ? 'border-slate-800 bg-[#111827]' : 'border-slate-200 bg-[#f8f8f7]';
  const rowBase = isDark ? 'hover:bg-slate-800/90' : 'hover:bg-slate-100';
  const selectedRow = isDark ? 'bg-slate-800 text-white' : 'bg-slate-200/90 text-slate-900';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-500';
  const mutedText = isDark ? 'text-slate-300' : 'text-slate-600';
  const chip = isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-700';
  const folderItems = [
    { key: 'all', label: 'All conversations', count: allInboxCounts.total_count },
    { key: 'incoming', label: 'Incoming emails', count: allInboxCounts.incoming_count },
    { key: 'sent', label: 'Sent emails', count: allInboxCounts.sent_count },
  ] as const;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => readStoredExpandedGroups(selectedMailbox, mailboxes));

  useEffect(() => {
    const nextState = readStoredExpandedGroups(selectedMailbox, mailboxes);
    setExpandedGroups((current) => ({ ...nextState, ...current, all: selectedMailbox === 'all' ? true : current.all ?? false }));
  }, [selectedMailbox, mailboxes]);

  useEffect(() => {
    try {
      window.localStorage.setItem('hello-agent-mailbox-expanded-groups', JSON.stringify(expandedGroups));
    } catch {
      // ignore storage access issues
    }
  }, [expandedGroups]);

  const ensureSelectedGroupExpanded = (groupKey: string) => {
    setExpandedGroups((current) => {
      const next = { ...current };
      const groupKeys = ['all', ...mailboxes.map((mailbox) => mailbox.address)];
      groupKeys.forEach((key) => {
        next[key] = key === groupKey ? true : false;
      });
      return next;
    });
  };

  const renderGroupHeader = (groupKey: string, label: string, count: number, icon: 'all' | 'mailbox', mailboxAddress?: string) => {
    const isSelected = groupKey === 'all' ? selectedMailbox === 'all' : selectedMailbox === mailboxAddress;
    const isExpanded = Boolean(expandedGroups[groupKey]);
    const buttonTextClasses = isSelected ? selectedRow : `${rowBase} ${mutedText}`;

    return (
      <div key={groupKey} className="rounded-xl">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (groupKey === 'all') {
                onSelectMailbox('all');
              } else if (mailboxAddress) {
                onSelectMailbox(mailboxAddress);
              }
              ensureSelectedGroupExpanded(groupKey);
            }}
            className={`flex min-w-0 flex-1 items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${buttonTextClasses}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              {icon === 'all' ? <Inbox className="h-4 w-4 shrink-0" /> : <Mail className="h-4 w-4 shrink-0" />}
              <span className="truncate text-sm font-medium">{label}</span>
            </span>
            {count > 0 ? (
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${chip}`}>{count}</span>
            ) : null}
          </button>

          <button
            type="button"
            aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
            onClick={() => {
              setExpandedGroups((current) => ({
                ...current,
                [groupKey]: !Boolean(current[groupKey]),
              }));
            }}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${isDark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isExpanded ? (
          <div className="mt-1 space-y-1 pl-3">
            {folderItems.map((folder) => {
              const isActive = groupKey === 'all'
                ? selectedMailbox === 'all' && selectedFolder === folder.key
                : selectedMailbox === mailboxAddress && selectedFolder === folder.key;

              return (
                <button
                  key={`${groupKey}-${folder.key}`}
                  type="button"
                  onClick={() => {
                    if (groupKey === 'all') {
                      onSelectFolder(folder.key, 'all');
                    } else if (mailboxAddress) {
                      onSelectFolder(folder.key, mailboxAddress);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition ${isActive ? (isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900') : `${rowBase} ${mutedText}`}`}
                >
                  <span className="min-w-0 break-words">{folder.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${chip}`}>{folder.count}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <aside className={`flex h-full min-w-0 flex-col border-r ${shell}`} style={{ width: 64 }}>
        <div className={`flex shrink-0 items-center justify-center border-b px-2 py-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            type="button"
            title="Expand mailbox sidebar"
            aria-label="Expand mailbox sidebar"
            onClick={onToggleCollapse}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              title="All inboxes"
              aria-label="All inboxes"
              onClick={() => {
                onSelectMailbox('all');
                ensureSelectedGroupExpanded('all');
              }}
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border ${selectedMailbox === 'all' ? (isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-200 text-slate-900') : (isDark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}`}
            >
              <Inbox className="h-4 w-4" />
              {unreadTotal > 0 ? (
                <span className={`absolute -right-1 -top-1 rounded-full px-1 py-0.5 text-[8px] font-semibold ${chip}`}>
                  {unreadTotal > 99 ? '99+' : unreadTotal}
                </span>
              ) : null}
            </button>

            {mailboxes.map((mailbox) => (
              <button
                key={mailbox.id}
                type="button"
                title={mailbox.display_name || mailbox.address}
                aria-label={mailbox.display_name || mailbox.address}
                onClick={() => {
                  onSelectMailbox(mailbox.address);
                  ensureSelectedGroupExpanded(mailbox.address);
                }}
                className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border ${selectedMailbox === mailbox.address ? (isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-200 text-slate-900') : (isDark ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}`}
              >
                <Mail className="h-4 w-4" />
                {mailbox.unread_count > 0 ? (
                  <span className={`absolute -right-1 -top-1 rounded-full px-1 py-0.5 text-[8px] font-semibold ${chip}`}>
                    {mailbox.unread_count > 99 ? '99+' : mailbox.unread_count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className={`shrink-0 border-t p-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={onToggleTheme}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Logout"
              title="Logout"
              onClick={onLogout}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`flex h-full min-w-0 flex-col border-r ${shell}`}>
      <div className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-slate-100 text-slate-900' : 'bg-[#111827] text-white'}`}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className={`truncate text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hello Agent Inbox</div>
        </div>

        <button
          type="button"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          onClick={onToggleCollapse}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {renderGroupHeader('all', 'All inboxes', unreadTotal, 'all')}
        <div className={`mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${subtleText}`}>Inboxes</div>
        <div className="space-y-2">
          {mailboxes.map((mailbox) => renderGroupHeader(
            mailbox.address,
            mailbox.display_name || mailbox.address,
            mailbox.unread_count,
            'mailbox',
            mailbox.address,
          ))}
        </div>
      </div>

      <div className={`shrink-0 border-t p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Hello Agent user'}</div>
            <div title={user?.email || ''} className={`truncate text-xs ${subtleText}`}>
              {user?.email || ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={onToggleTheme}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Logout"
              title="Logout"
              onClick={onLogout}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <Settings className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
