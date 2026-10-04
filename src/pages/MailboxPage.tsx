import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/mailbox/Sidebar';
import { ThreadList } from '../components/mailbox/ThreadList';
import { ThreadView } from '../components/mailbox/ThreadView';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../ThemeContext';
import { getEmailMessage, getMailboxes, getThread, getThreads, type EmailListItem, type Mailbox, type MessageItem, type ThreadDetails, type ThreadItem } from '../services/mailboxApi';

export default function MailboxPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const mailboxQuery = searchParams.get('mailbox') || 'all';
  const searchTerm = searchParams.get('q') || '';
  const filterValue = searchParams.get('filter');
  const filter: 'all' | 'unread' | 'replied' = filterValue === 'unread' || filterValue === 'replied'
    ? filterValue
    : 'all';
  const folderValue = searchParams.get('folder');
  const folder: 'all' | 'incoming' | 'sent' = folderValue === 'incoming' || folderValue === 'sent'
    ? folderValue
    : 'all';
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [threads, setThreads] = useState<Array<ThreadItem | EmailListItem>>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadDetails | null>(null);
  const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageItem[]>([]);
  const [agentFilter, setAgentFilter] = useState('all');
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState('');
  const [mailboxError, setMailboxError] = useState('');
  const [listRetryKey, setListRetryKey] = useState(0);
  const [threadRetryKey, setThreadRetryKey] = useState(0);
  const threadRequestId = useRef(0);

  const selectedThreadId = params.threadId ? Number(params.threadId) : null;
  const threadSelectionKey = `${folder}:${selectedThreadId ?? ''}`;
  const threadSelectionKeyRef = useRef(threadSelectionKey);
  threadSelectionKeyRef.current = threadSelectionKey;
  const isDark = theme === 'dark';
  const allInboxCounts = useMemo(() => ({
    incoming_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.incoming_count, 0),
    sent_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.sent_count, 0),
    total_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.thread_count, 0),
  }), [mailboxes]);

  const unreadTotal = useMemo(
    () => mailboxes.reduce((sum, mailbox) => sum + mailbox.unread_count, 0),
    [mailboxes]
  );

  useEffect(() => {
    const loadMailboxes = async () => {
      try {
        setMailboxError('');
        const data = await getMailboxes();
        setMailboxes(data.mailboxes);
      } catch (error) {
        setMailboxError(error instanceof Error ? error.message : 'Unable to load mailboxes');
      }
    };

    loadMailboxes();
  }, [listRetryKey]);

  useEffect(() => {
    let latestRequest = 0;
    const loadThreads = async () => {
      const requestId = ++latestRequest;
      try {
        setListLoading(true);
        const data = await getThreads({
          mailbox: mailboxQuery,
          q: searchTerm,
          filter: filter === 'unread' ? 'unread' : 'all',
          folder,
        });
        if (!active || requestId !== latestRequest) return;
        setThreads(folder === 'all' ? data.threads || [] : data.emails || []);
      } catch (error) {
        if (!active || requestId !== latestRequest) return;
        setMailboxError(error instanceof Error ? error.message : 'Unable to load threads');
      } finally {
        if (active && requestId === latestRequest) setListLoading(false);
      }
    };

    let active = true;
    const timer = window.setTimeout(loadThreads, 300);
    const refreshId = window.setInterval(loadThreads, 30000);

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearInterval(refreshId);
    };
  }, [listRetryKey, mailboxQuery, searchTerm, filter, folder]);

  useEffect(() => {
    const requestId = ++threadRequestId.current;
    const selectionKey = threadSelectionKey;
    let active = true;
    const loadThread = async () => {
      if (!selectedThreadId) {
        setSelectedThread(null);
        setSelectedThreadMessages([]);
        setThreadError('');
        setThreadLoading(false);
        return;
      }

      try {
        setThreadLoading(true);
        setThreadError('');
        if (folder === 'all') {
          const data = await getThread(selectedThreadId);
          if (!active || requestId !== threadRequestId.current || threadSelectionKeyRef.current !== selectionKey) return;
          setSelectedThread(data.thread);
          setSelectedThreadMessages(data.messages);
        } else {
          const data = await getEmailMessage(selectedThreadId);
          if (!active || requestId !== threadRequestId.current || threadSelectionKeyRef.current !== selectionKey) return;
          setSelectedThread(data.thread);
          setSelectedThreadMessages([data.message]);
        }
        void getMailboxes()
          .then((mailboxData) => {
            if (active && requestId === threadRequestId.current && threadSelectionKeyRef.current === selectionKey) {
              setMailboxes(mailboxData.mailboxes);
            }
          })
          .catch((refreshError) => {
            if (active && requestId === threadRequestId.current && threadSelectionKeyRef.current === selectionKey) {
              setMailboxError(refreshError instanceof Error ? refreshError.message : 'Unable to load mailboxes');
            }
          });
      } catch (error) {
        if (active && requestId === threadRequestId.current && threadSelectionKeyRef.current === selectionKey) {
          setThreadError(error instanceof Error ? error.message : 'Unable to load thread');
        }
      } finally {
        if (active && requestId === threadRequestId.current && threadSelectionKeyRef.current === selectionKey) {
          setThreadLoading(false);
        }
      }
    };

    void loadThread();
    return () => {
      active = false;
      if (requestId === threadRequestId.current) threadRequestId.current += 1;
    };
  }, [selectedThreadId, folder, threadRetryKey]);

  const updateQuery = (key: 'q' | 'filter', value: string) => {
    const nextParams = new URLSearchParams(location.search);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    const queryString = nextParams.toString();
    navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  const handleSelectMailbox = (value: string) => {
    const nextParams = new URLSearchParams();
    if (value !== 'all') nextParams.set('mailbox', value);
    if (selectedThreadId) {
      if (folder !== 'all') nextParams.set('folder', folder);
    } else {
      if (searchTerm) nextParams.set('q', searchTerm);
      if (filter !== 'all') nextParams.set('filter', filter);
      if (folder !== 'all') nextParams.set('folder', folder);
    }
    const queryString = nextParams.toString();
    navigate(queryString ? `/mailbox?${queryString}` : '/mailbox');
  };

  const handleSelectFolder = (value: 'all' | 'incoming' | 'sent', mailbox: string) => {
    const nextParams = new URLSearchParams();
    if (mailbox !== 'all') nextParams.set('mailbox', mailbox);
    if (searchTerm) nextParams.set('q', searchTerm);
    if (filter !== 'all') nextParams.set('filter', filter);
    if (value !== 'all') nextParams.set('folder', value);
    const queryString = nextParams.toString();
    navigate(queryString ? `/mailbox?${queryString}` : '/mailbox');
  };

  const handleSelectThread = (threadId: number) => {
    navigate(`/mailbox/${threadId}${location.search}`);
  };

  const agentOptions = useMemo(() => {
    const uniqueAgents = Array.from(
      new Set(
        threads
          .map((thread) => ('thread_id' in thread ? thread.agent_name : thread.last_agent))
          .filter((agent): agent is string => Boolean(agent))
      )
    );
    return uniqueAgents;
  }, [threads]);

  const handleLogout = async () => {
    await logout();
  };

  const selectedMailboxName = mailboxQuery === 'all'
    ? 'All inboxes'
    : (mailboxes.find((mailbox) => mailbox.address === mailboxQuery)?.display_name || mailboxQuery);

  const mailboxFolderLabel = folder === 'incoming'
    ? 'Incoming emails'
    : folder === 'sent'
      ? 'Sent emails'
      : 'All conversations';

  return (
    <div className={isDark ? 'flex h-[100dvh] overflow-hidden bg-[#111827] text-slate-100' : 'flex h-[100dvh] overflow-hidden bg-[#f5f5f4] text-slate-900'}>
      {mailboxError ? (
        <div className={isDark ? 'flex min-h-screen items-center justify-center bg-[#111827] p-6' : 'flex min-h-screen items-center justify-center bg-[#f5f5f4] p-6'}>
          <div className={isDark ? 'max-w-md rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-200' : 'max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700'}>
            <div className="text-lg font-semibold">Mailbox unavailable</div>
            <div className={isDark ? 'mt-2 text-sm text-red-300' : 'mt-2 text-sm text-red-600'}>{mailboxError}</div>
            <button type="button" onClick={() => setListRetryKey((value) => value + 1)} className={isDark ? 'mt-4 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-400' : 'mt-4 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500'}>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 w-full overflow-hidden border-t border-slate-200/80">
          <div className={`flex h-full min-h-0 w-[clamp(110px,18vw,280px)] min-w-0 shrink-0 ${selectedThreadId ? 'max-[767px]:hidden' : ''}`}>
            <Sidebar
              mailboxes={mailboxes}
              selectedMailbox={mailboxQuery}
              unreadTotal={unreadTotal}
              user={user}
              onSelectMailbox={handleSelectMailbox}
              onSelectFolder={handleSelectFolder}
              selectedFolder={folder}
              allInboxCounts={allInboxCounts}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
              isDark={isDark}
            />
          </div>

          <div className={`flex h-full min-h-0 w-[clamp(190px,30vw,440px)] min-w-0 shrink-0 ${selectedThreadId ? 'max-[767px]:hidden' : ''}`}>
            <ThreadList
              threads={threads}
              folder={folder}
              selectedThreadId={selectedThreadId}
              selectedMailboxLabel={`${selectedMailboxName} · ${mailboxFolderLabel}`}
              totalThreads={threads.length}
              searchTerm={searchTerm}
              filter={filter}
              agentFilter={agentFilter}
              agentOptions={agentOptions}
              onSearchChange={(value) => updateQuery('q', value)}
              onFilterChange={(value) => updateQuery('filter', value)}
              onAgentFilterChange={setAgentFilter}
              onSelectThread={handleSelectThread}
              onRetry={() => setListRetryKey((value) => value + 1)}
              loading={listLoading}
              isDark={isDark}
            />
          </div>

          <div className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${!selectedThreadId ? 'max-[767px]:hidden' : ''}`}>
            <ThreadView
              thread={selectedThread}
              messages={selectedThreadMessages}
              loading={threadLoading}
              error={threadError}
              folder={folder}
              onBack={() => navigate('/mailbox' + location.search)}
              onRetry={() => setThreadRetryKey((value) => value + 1)}
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </div>
  );
}
