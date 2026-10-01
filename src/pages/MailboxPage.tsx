import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/mailbox/Sidebar';
import { ThreadList } from '../components/mailbox/ThreadList';
import { ThreadView } from '../components/mailbox/ThreadView';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../ThemeContext';
import { getMailboxes, getThread, getThreads, type Mailbox, type MessageItem, type ThreadDetails, type ThreadItem } from '../services/mailboxApi';

export default function MailboxPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const params = useParams();
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadDetails | null>(null);
  const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageItem[]>([]);
  const [mailboxQuery, setMailboxQuery] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [folder, setFolder] = useState<'all' | 'incoming' | 'sent'>('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [listLoading, setListLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState('');
  const [mailboxError, setMailboxError] = useState('');
  const [listRetryKey, setListRetryKey] = useState(0);

  const selectedThreadId = params.threadId ? Number(params.threadId) : null;
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
    const searchParams = new URLSearchParams(location.search);
    const selectedMailbox = searchParams.get('mailbox') || 'all';
    const searchedText = searchParams.get('q') || '';
    const folderValue = searchParams.get('folder') === 'incoming'
      ? 'incoming'
      : searchParams.get('folder') === 'sent'
        ? 'sent'
        : 'all';
    const filterValue = searchParams.get('filter') === 'unread'
      ? 'unread'
      : searchParams.get('filter') === 'replied'
        ? 'replied'
        : 'all';
    setMailboxQuery(selectedMailbox);
    setSearchTerm(searchedText);
    setFolder(folderValue);
    setFilter(filterValue);
  }, [location.search]);

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
    const loadThreads = async () => {
      try {
        setListLoading(true);
        const data = await getThreads({
          mailbox: mailboxQuery,
          q: searchTerm,
          filter: filter === 'unread' ? 'unread' : 'all',
          folder,
        });
        setThreads(data.threads);
      } catch (error) {
        setMailboxError(error instanceof Error ? error.message : 'Unable to load threads');
      } finally {
        setListLoading(false);
      }
    };

    const timer = window.setTimeout(loadThreads, 300);
    const refreshId = window.setInterval(loadThreads, 30000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(refreshId);
    };
  }, [listRetryKey, mailboxQuery, searchTerm, filter, folder]);

  useEffect(() => {
    const loadThread = async () => {
      if (!selectedThreadId) {
        setSelectedThread(null);
        setSelectedThreadMessages([]);
        setThreadError('');
        return;
      }

      try {
        setThreadLoading(true);
        setThreadError('');
        const data = await getThread(selectedThreadId);
        setSelectedThread(data.thread);
        setSelectedThreadMessages(data.messages);
        void getMailboxes()
          .then((mailboxData) => setMailboxes(mailboxData.mailboxes))
          .catch((refreshError) => setMailboxError(refreshError instanceof Error ? refreshError.message : 'Unable to load mailboxes'));
      } catch (error) {
        setThreadError(error instanceof Error ? error.message : 'Unable to load thread');
      } finally {
        setThreadLoading(false);
      }
    };

    loadThread();
  }, [selectedThreadId]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (mailboxQuery !== 'all') nextParams.set('mailbox', mailboxQuery);
    if (searchTerm) nextParams.set('q', searchTerm);
    if (filter !== 'all') nextParams.set('filter', filter);
    if (folder !== 'all') nextParams.set('folder', folder);

    const queryString = nextParams.toString();
    const basePath = selectedThreadId ? `/mailbox/${selectedThreadId}` : '/mailbox';
    const nextUrl = queryString ? `${basePath}?${queryString}` : basePath;

    if (location.pathname !== basePath || location.search !== (queryString ? `?${queryString}` : '')) {
      navigate(nextUrl, { replace: true });
    }
  }, [mailboxQuery, searchTerm, filter, folder, selectedThreadId, navigate, location.pathname, location.search]);

  const handleSelectMailbox = (value: string) => {
    setMailboxQuery(value);
    setSelectedThread(null);
    setSelectedThreadMessages([]);
    setThreadError('');
    if (selectedThreadId) {
      const nextParams = new URLSearchParams();
      if (value !== 'all') nextParams.set('mailbox', value);
      if (folder !== 'all') nextParams.set('folder', folder);
      const queryString = nextParams.toString();
      navigate(queryString ? `/mailbox?${queryString}` : '/mailbox');
    }
  };

  const handleSelectThread = (threadId: number) => {
    const nextParams = new URLSearchParams();
    if (mailboxQuery !== 'all') nextParams.set('mailbox', mailboxQuery);
    if (searchTerm) nextParams.set('q', searchTerm);
    if (filter !== 'all') nextParams.set('filter', filter);
    if (folder !== 'all') nextParams.set('folder', folder);

    const queryString = nextParams.toString();
    navigate(queryString ? `/mailbox/${threadId}?${queryString}` : `/mailbox/${threadId}`);
  };

  const agentOptions = useMemo(() => {
    const uniqueAgents = Array.from(
      new Set(
        threads
          .map((thread) => thread.last_agent)
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
              onSelectFolder={setFolder}
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
              selectedThreadId={selectedThreadId}
              selectedMailboxLabel={`${selectedMailboxName} · ${mailboxFolderLabel}`}
              totalThreads={threads.length}
              searchTerm={searchTerm}
              filter={filter}
              agentFilter={agentFilter}
              agentOptions={agentOptions}
              onSearchChange={setSearchTerm}
              onFilterChange={setFilter}
              onAgentFilterChange={setAgentFilter}
              onSelectThread={handleSelectThread}
              onRetry={() => setListRetryKey((value) => value + 1)}
              loading={listLoading}
              isDark={isDark}
            />
          </div>

          <div className={`flex min-h-0 min-w-0 flex-1 ${!selectedThreadId ? 'max-[767px]:hidden' : ''}`}>
            <ThreadView
              thread={selectedThread}
              messages={selectedThreadMessages}
              loading={threadLoading}
              error={threadError}
              onBack={() => navigate('/mailbox' + location.search)}
              onRetry={() => selectedThreadId && getThread(selectedThreadId).then((data) => {
                setSelectedThread(data.thread);
                setSelectedThreadMessages(data.messages);
                setThreadError('');
                void getMailboxes()
                  .then((mailboxData) => setMailboxes(mailboxData.mailboxes))
                  .catch((refreshError) => setMailboxError(refreshError instanceof Error ? refreshError.message : 'Unable to load mailboxes'));
              }).catch((error) => setThreadError(error instanceof Error ? error.message : 'Unable to load thread'))}
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </div>
  );
}
