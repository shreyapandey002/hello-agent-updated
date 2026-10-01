import { Inbox, Mail, Settings, Sparkles } from 'lucide-react';
import type { User } from '../../context/AuthContext';
import type { Mailbox as MailboxType } from '../../services/mailboxApi';

export function Sidebar({
  mailboxes,
  selectedMailbox,
  unreadTotal,
  user,
  onSelectMailbox,
  onSelectFolder,
  selectedFolder,
  allInboxCounts,
  onLogout,
  isDark,
}: {
  mailboxes: MailboxType[];
  selectedMailbox: string;
  unreadTotal: number;
  user: User | null;
  onSelectMailbox: (address: string) => void;
  onSelectFolder: (folder: 'all' | 'incoming' | 'sent') => void;
  selectedFolder: 'all' | 'incoming' | 'sent';
  allInboxCounts: { incoming_count: number; sent_count: number; total_count: number };
  onLogout: () => void;
  isDark: boolean;
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

  return (
    <aside className={`flex h-full flex-col border-r ${shell}`}>
      <div className={`flex items-center gap-3 border-b px-4 py-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'bg-slate-100 text-slate-900' : 'bg-[#111827] text-white'}`}>
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hello Agent Inbox</div>
        </div>
      </div>

      <div className="px-3 py-4">
        <button
          type="button"
          onClick={() => {
            onSelectMailbox('all');
            onSelectFolder('all');
          }}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${selectedMailbox === 'all' ? selectedRow : `${rowBase} ${mutedText}`}`}
        >
          <span className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span className="font-medium">All inboxes</span>
          </span>
          {unreadTotal > 0 ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip}`}>{unreadTotal}</span>
          ) : null}
        </button>

        <div className="mt-2 space-y-1 pl-3">
          {folderItems.map((folder) => {
            const isActive = selectedMailbox === 'all' && selectedFolder === folder.key;
            return (
              <button
                key={folder.key}
                type="button"
                onClick={() => {
                  onSelectMailbox('all');
                  onSelectFolder(folder.key);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition ${isActive ? (isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900') : `${rowBase} ${mutedText}`}`}
              >
                <span>{folder.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${chip}`}>{folder.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className={`mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${subtleText}`}>Inboxes</div>
        <div className="space-y-2">
          {mailboxes.map((mailbox) => {
            const mailboxFolders = [
              { key: 'all', label: 'All conversations', count: mailbox.thread_count },
              { key: 'incoming', label: 'Incoming emails', count: mailbox.incoming_count },
              { key: 'sent', label: 'Sent emails', count: mailbox.sent_count },
            ] as const;

            return (
              <div key={mailbox.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectMailbox(mailbox.address);
                    onSelectFolder('all');
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${selectedMailbox === mailbox.address ? selectedRow : `${rowBase} ${mutedText}`}`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate text-sm">{mailbox.display_name || mailbox.address}</span>
                  </span>
                  {mailbox.unread_count > 0 ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${chip}`}>{mailbox.unread_count}</span>
                  ) : null}
                </button>

                <div className="mt-1 space-y-1 pl-3">
                  {mailboxFolders.map((folder) => {
                    const isActive = selectedMailbox === mailbox.address && selectedFolder === folder.key;
                    return (
                      <button
                        key={`${mailbox.id}-${folder.key}`}
                        type="button"
                        onClick={() => {
                          onSelectMailbox(mailbox.address);
                          onSelectFolder(folder.key);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition ${isActive ? (isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900') : `${rowBase} ${mutedText}`}`}
                      >
                        <span>{folder.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${chip}`}>{folder.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`mt-auto border-t p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Hello Agent user'}</div>
            <div className={`truncate text-xs ${subtleText}`}>{user?.email || ''}</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <Settings className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
