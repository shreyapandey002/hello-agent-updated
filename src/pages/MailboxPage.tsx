import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, ChevronDown, Copy, Moon, Search, SunMedium, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/mailbox/Sidebar';
import { ThreadList } from '../components/mailbox/ThreadList';
import { ThreadView } from '../components/mailbox/ThreadView';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../ThemeContext';
import { getEmailMessage, getMailboxes, getThread, getThreads, type EmailListItem, type Mailbox, type MessageItem, type ThreadDetails, type ThreadFilter, type ThreadItem } from '../services/mailboxApi';

const DEFAULT_SIDEBAR_WIDTH = 280;
const DEFAULT_LIST_WIDTH = 440;
const SIDEBAR_MIN_WIDTH = 200;
const LIST_MIN_WIDTH = 320;
const THREAD_MIN_WIDTH = 360;

function clampSidebarWidth(value: number, viewportWidth: number) {
  const maxSidebarPercentWidth = viewportWidth * 0.4;
  const maxSidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, maxSidebarPercentWidth);
  return Math.min(Math.max(value, SIDEBAR_MIN_WIDTH), maxSidebarWidth);
}

function clampListWidth(value: number, viewportWidth: number, sidebarWidth: number) {
  const maxListWidth = Math.max(LIST_MIN_WIDTH, viewportWidth - sidebarWidth - THREAD_MIN_WIDTH);
  return Math.min(Math.max(value, LIST_MIN_WIDTH), maxListWidth);
}

function readLocalNumber(key: string, fallback: number) {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return fallback;
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readLocalBoolean(key: string, fallback: boolean) {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === null) return fallback;
    return rawValue === 'true';
  } catch {
    return fallback;
  }
}

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
  const filter: ThreadFilter = filterValue === 'unread' || filterValue === 'replied' || filterValue === 'needs_attention'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => readLocalBoolean('hello-agent-mailbox-sidebar-collapsed', false));
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => readLocalNumber('hello-agent-mailbox-sidebar-width', DEFAULT_SIDEBAR_WIDTH));
  const [listWidth, setListWidth] = useState<number>(() => readLocalNumber('hello-agent-mailbox-list-width', DEFAULT_LIST_WIDTH));
  const [copiedInbox, setCopiedInbox] = useState(false);
  const [copyToast, setCopyToast] = useState('');
  const [inboxMenuOpen, setInboxMenuOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [draggingDivider, setDraggingDivider] = useState<string | null>(null);
  const dragRef = useRef<{ divider: 'sidebar' | 'list'; startX: number; startWidth: number; pointerId: number } | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const threadRequestId = useRef(0);
  const threadsRef = useRef(threads);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inboxSwitcherRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<number | null>(null);
  const priorSidebarCollapsed = useRef<boolean | null>(null);
  threadsRef.current = threads;

  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 768);
      setSidebarWidth((current) => clampSidebarWidth(current, window.innerWidth));
      setListWidth((current) => clampListWidth(current, window.innerWidth, sidebarWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarWidth]);

  const stopDrag = () => {
    const cleanup = dragCleanupRef.current;
    if (cleanup) {
      cleanup();
      dragCleanupRef.current = null;
    }

    dragRef.current = null;
    setDraggingDivider(null);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  useEffect(() => {
    if (!draggingDivider) {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      return;
    }

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [draggingDivider]);

  useEffect(() => {
    return () => {
      stopDrag();
    };
  }, []);

  useEffect(() => {
    if (priorSidebarCollapsed.current !== null) return;
    try {
      window.localStorage.setItem('hello-agent-mailbox-sidebar-collapsed', String(sidebarCollapsed));
    } catch {
      // ignore storage access issues
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      window.localStorage.setItem('hello-agent-mailbox-sidebar-width', String(sidebarWidth));
    } catch {
      // ignore storage access issues
    }
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      window.localStorage.setItem('hello-agent-mailbox-list-width', String(listWidth));
    } catch {
      // ignore storage access issues
    }
  }, [listWidth]);

  const selectedThreadId = params.threadId ? Number(params.threadId) : null;
  useEffect(() => {
    if (selectedThreadId) {
      if (priorSidebarCollapsed.current === null) {
        priorSidebarCollapsed.current = sidebarCollapsed;
        setSidebarCollapsed(true);
      }
    } else if (priorSidebarCollapsed.current !== null) {
      setSidebarCollapsed(priorSidebarCollapsed.current);
      priorSidebarCollapsed.current = null;
    }
  }, [selectedThreadId, sidebarCollapsed]);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName || '')) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  useEffect(() => {
    if (!inboxMenuOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (!inboxSwitcherRef.current?.contains(event.target as Node)) setInboxMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInboxMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [inboxMenuOpen]);

  useEffect(() => () => {
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
  }, []);
  const threadSelectionKey = `${folder}:${selectedThreadId ?? ''}`;
  const threadSelectionKeyRef = useRef(threadSelectionKey);
  threadSelectionKeyRef.current = threadSelectionKey;
  const isDark = theme === 'dark';
  const allInboxCounts = useMemo(() => ({
    incoming_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.incoming_count, 0),
    sent_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.sent_count, 0),
    total_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.thread_count, 0),
    needs_attention_count: mailboxes.reduce((sum, mailbox) => sum + mailbox.needs_attention_count, 0),
  }), [mailboxes]);
  const selectedMailboxCounts = mailboxQuery === 'all'
    ? allInboxCounts
    : mailboxes.find((mailbox) => mailbox.address === mailboxQuery) || allInboxCounts;
  const selectedFolderCount = filter === 'needs_attention'
    ? selectedMailboxCounts.needs_attention_count
    : folder === 'incoming'
    ? selectedMailboxCounts.incoming_count
    : folder === 'sent'
      ? selectedMailboxCounts.sent_count
      : selectedMailboxCounts.total_count;

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
    const loadThreads = async (showLoading: boolean) => {
      const requestId = ++latestRequest;
      try {
        if (showLoading) setListLoading(true);
        const data = await getThreads({
          mailbox: mailboxQuery,
          q: searchTerm,
          filter: filter === 'replied' ? 'all' : filter,
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
    const timer = window.setTimeout(() => loadThreads(true), 300);
    const refreshId = window.setInterval(() => loadThreads(false), 30000);

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
        const selectedListItem = threadsRef.current.find((item) => item.id === selectedThreadId);
        const refreshMailboxCounts = !selectedListItem
          || ('thread_unread' in selectedListItem ? selectedListItem.thread_unread : selectedListItem.unread);
        if (selectedListItem) {
          setThreads((current) => current.map((item) => {
            if (item.id !== selectedThreadId) return item;
            return 'thread_unread' in item ? { ...item, thread_unread: false } : { ...item, unread: false };
          }));
        }
        if (refreshMailboxCounts) {
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
        }
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
    setInboxMenuOpen(false);
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

  const handleSelectFolder = (value: 'all' | 'incoming' | 'sent' | 'needs_attention', mailbox: string) => {
    const nextParams = new URLSearchParams();
    if (mailbox !== 'all') nextParams.set('mailbox', mailbox);
    if (searchTerm) nextParams.set('q', searchTerm);
    if (value === 'needs_attention') {
      nextParams.set('filter', 'needs_attention');
    } else {
      if (filter !== 'all' && filter !== 'needs_attention') nextParams.set('filter', filter);
      if (value !== 'all') nextParams.set('folder', value);
    }
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

  const navigationThreadIds = useMemo(() => threads.filter((item) => {
    const isEmail = 'thread_id' in item;
    const unread = isEmail ? item.thread_unread : item.unread;
    const replied = isEmail
      ? item.direction === 'outbound' && item.status !== 'failed'
      : item.last_direction === 'outbound' && item.last_status !== 'failed';
    const agent = isEmail ? item.agent_name : item.last_agent;
    return (filter !== 'unread' || unread || item.id === selectedThreadId)
      && (filter !== 'replied' || replied)
      && (agentFilter === 'all' || (agent || '') === agentFilter);
  }).map((item) => item.id), [threads, filter, agentFilter, selectedThreadId]);

  const handleLogout = async () => {
    await logout();
  };

  const selectedMailboxName = mailboxQuery === 'all'
    ? 'All inboxes'
    : (mailboxes.find((mailbox) => mailbox.address === mailboxQuery)?.display_name || mailboxQuery);

  const copyInboxAddress = async () => {
    if (mailboxQuery === 'all') return;
    const address = mailboxQuery;
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = address;
      fallback.style.position = 'fixed';
      fallback.style.opacity = '0';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    setCopiedInbox(true);
    setCopyToast(`Copied ${address}`);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedInbox(false);
      setCopyToast('');
      copyTimerRef.current = null;
    }, 2000);
  };

  const mailboxFolderLabel = folder === 'incoming'
    ? 'Incoming emails'
    : folder === 'sent'
      ? 'Sent emails'
      : filter === 'needs_attention'
        ? 'Needs Attention'
        : 'All conversations';
  const mobileListLayout = isMobileLayout && !selectedThreadId;
  const sidebarPaneWidth = sidebarCollapsed ? 64 : sidebarWidth;

  const beginDrag = (divider: 'sidebar' | 'list', startX: number, startWidth: number, pointerId: number) => {
    dragRef.current = { divider, startX, startWidth, pointerId };
    setDraggingDivider(divider);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handlePointerMove = (pointerMoveEvent: PointerEvent) => {
      const dragState = dragRef.current;
      if (!dragState || dragState.pointerId !== pointerMoveEvent.pointerId) {
        return;
      }

      if (pointerMoveEvent.buttons === 0) {
        stopDrag();
        return;
      }

      if (dragState.divider === 'sidebar') {
        const nextWidth = clampSidebarWidth(dragState.startWidth + (pointerMoveEvent.clientX - dragState.startX), window.innerWidth);
        setSidebarWidth(nextWidth);
        setListWidth((current) => clampListWidth(current, window.innerWidth, nextWidth));
      } else {
        const nextWidth = clampListWidth(dragState.startWidth + (pointerMoveEvent.clientX - dragState.startX), window.innerWidth, sidebarWidth);
        setListWidth(nextWidth);
      }
    };

    const handlePointerEnd = (pointerEndEvent: PointerEvent | KeyboardEvent | Event) => {
      if ('pointerId' in pointerEndEvent && dragRef.current && pointerEndEvent.pointerId !== dragRef.current.pointerId) {
        return;
      }
      stopDrag();
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd as EventListener);
      window.removeEventListener('pointercancel', handlePointerEnd as EventListener);
      window.removeEventListener('blur', handlePointerEnd as EventListener);
      window.removeEventListener('keydown', handleEscapeKey as EventListener);
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        stopDrag();
      }
    };

    dragCleanupRef.current = cleanup;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd as EventListener);
    window.addEventListener('pointercancel', handlePointerEnd as EventListener);
    window.addEventListener('blur', handlePointerEnd as EventListener);
    window.addEventListener('keydown', handleEscapeKey);
  };

  const handleSidebarResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isMobileLayout) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    beginDrag('sidebar', event.clientX, sidebarWidth, event.pointerId);
  };

  const handleListResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isMobileLayout) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    beginDrag('list', event.clientX, listWidth, event.pointerId);
  };

  const dividerClasses = isDark
    ? 'bg-transparent hover:bg-slate-500/20'
    : 'bg-transparent hover:bg-slate-300/70';

  const dividerLineClass = isDark
    ? 'bg-slate-700 group-hover:bg-sky-400 group-[.dragging]:bg-sky-400'
    : 'bg-slate-300 group-hover:bg-sky-500 group-[.dragging]:bg-sky-500';

  return (
    <div className={isDark ? 'flex h-[100dvh] overflow-hidden bg-[#111827] text-slate-100' : 'flex h-[100dvh] overflow-hidden bg-[#f5f5f4] text-slate-900'}>
      {draggingDivider ? (
        <div className="fixed inset-0 z-50" style={{ cursor: 'col-resize' }} />
      ) : null}
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
        <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border-t border-slate-200/80">
          <header className={`relative flex h-14 shrink-0 items-center gap-3 border-b px-4 ${isDark ? 'border-slate-800 bg-[#111827]' : 'border-slate-200 bg-white'}`}>
            <div className="flex min-w-0 shrink-0 items-center gap-2 text-sm">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mailbox</span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>›</span>
              <div ref={inboxSwitcherRef} className="relative min-w-0">
                <button
                  type="button"
                  aria-label="Switch inbox"
                  aria-haspopup="listbox"
                  aria-expanded={inboxMenuOpen}
                  onClick={() => setInboxMenuOpen((open) => !open)}
                  className={`flex max-w-48 items-center gap-1 truncate rounded-md px-1.5 py-1 font-semibold ${isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-900 hover:bg-slate-100'}`}
                >
                  <span className="truncate">{selectedMailboxName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${inboxMenuOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
                {inboxMenuOpen ? (
                  <div role="listbox" aria-label="Choose inbox" className={`thin-scrollbar absolute left-0 top-full z-50 mt-2 max-h-80 w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-md border p-1 shadow-xl ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
                    <button type="button" role="option" aria-selected={mailboxQuery === 'all'} onClick={() => handleSelectMailbox('all')} className={`flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left ${mailboxQuery === 'all' ? (isDark ? 'bg-slate-800' : 'bg-slate-100') : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')}`}>
                      <span className="min-w-0"><span className="block truncate text-sm font-medium">All inboxes</span><span className={`block truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Every connected inbox</span></span>
                      {mailboxQuery === 'all' ? <Check className="h-4 w-4 shrink-0 text-blue-500" /> : null}
                    </button>
                    {mailboxes.map((mailbox) => {
                      const selected = mailboxQuery === mailbox.address;
                      return (
                        <button key={mailbox.id} type="button" role="option" aria-selected={selected} onClick={() => handleSelectMailbox(mailbox.address)} className={`flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left ${selected ? (isDark ? 'bg-slate-800' : 'bg-slate-100') : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')}`}>
                          <span className="min-w-0"><span className="block truncate text-sm font-medium">{mailbox.display_name || mailbox.address}</span><span className={`block truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{mailbox.address}</span></span>
                          {selected ? <Check className="h-4 w-4 shrink-0 text-blue-500" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <span title={mailboxQuery === 'all' ? 'Select an inbox to copy its address' : 'Copy inbox address'}>
                <button
                  type="button"
                  disabled={mailboxQuery === 'all'}
                  onClick={() => void copyInboxAddress()}
                  title={mailboxQuery === 'all' ? 'Select an inbox to copy its address' : 'Copy inbox address'}
                  aria-label={mailboxQuery === 'all' ? 'Select an inbox to copy its address' : 'Copy inbox address'}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  {copiedInbox ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </span>
            </div>
            <div className={`relative mx-auto flex h-9 min-w-32 max-w-2xl flex-1 items-center rounded-md border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <Search className={`ml-3 h-4 w-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(event) => updateQuery('q', event.target.value)}
                placeholder="Search mail"
                aria-label="Search mail"
                className={`min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
              />
              {searchTerm ? <button type="button" onClick={() => updateQuery('q', '')} aria-label="Clear search" className={`mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><X className="h-4 w-4" /></button> : <kbd className={`mr-2 rounded border px-1.5 py-0.5 text-[10px] ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-500'}`}>/</kbd>}
            </div>
            <button
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${isDark ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {copyToast ? <div role="status" aria-live="polite" className={`absolute left-4 top-full z-50 mt-2 rounded-md border px-3 py-2 text-xs shadow-lg ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>{copyToast}</div> : null}
          </header>
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <div
            className={`relative flex h-full min-h-0 shrink-0 overflow-hidden ${selectedThreadId && isMobileLayout ? 'hidden' : ''}`}
            style={{
              width: mobileListLayout ? `min(${sidebarPaneWidth}px, max(160px, 40vw))` : sidebarPaneWidth,
              minWidth: mobileListLayout ? 0 : sidebarCollapsed ? 64 : undefined,
            }}
          >
            <Sidebar
              mailboxes={mailboxes}
              selectedMailbox={mailboxQuery}
              unreadTotal={unreadTotal}
              user={user}
              onSelectMailbox={handleSelectMailbox}
              onSelectFolder={handleSelectFolder}
              selectedFolder={folder}
              selectedFilter={filter}
              allInboxCounts={allInboxCounts}
              onLogout={handleLogout}
              isDark={isDark}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            />
            {!isMobileLayout && !sidebarCollapsed ? (
              <div
                className={`group absolute right-0 top-0 flex h-full w-8 cursor-col-resize items-center justify-center transition-all ${draggingDivider === 'sidebar' ? 'dragging' : ''} ${dividerClasses}`}
                onPointerDown={handleSidebarResizePointerDown}
                onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
                title="Resize sidebar"
                style={{ touchAction: 'none' }}
                onLostPointerCapture={() => stopDrag()}
              >
                <div className={`h-full w-px transition-all ${dividerLineClass} ${draggingDivider === 'sidebar' ? 'w-[2px]' : ''}`} />
              </div>
            ) : null}
          </div>

          <div
            className={`relative flex h-full min-h-0 min-w-0 overflow-x-hidden ${mobileListLayout ? 'flex-1' : 'shrink-0'} ${selectedThreadId && isMobileLayout ? 'hidden' : ''}`}
              style={mobileListLayout ? undefined : { width: selectedThreadId ? Math.min(listWidth, 360) : listWidth, minWidth: 0 }}
          >
            <ThreadList
              threads={threads}
              folder={folder}
              selectedThreadId={selectedThreadId}
              selectedMailboxLabel={`${selectedMailboxName} · ${mailboxFolderLabel}`}
              totalThreads={selectedFolderCount}
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
            {!isMobileLayout ? (
              <div
                className={`group absolute right-0 top-0 flex h-full w-8 cursor-col-resize items-center justify-end transition-all ${draggingDivider === 'list' ? 'dragging' : ''} ${dividerClasses}`}
                onPointerDown={handleListResizePointerDown}
                onDoubleClick={() => setListWidth(DEFAULT_LIST_WIDTH)}
                title="Resize conversation list"
                style={{ touchAction: 'none' }}
                onLostPointerCapture={() => stopDrag()}
              >
                <div className={`h-full w-px transition-all ${dividerLineClass} ${draggingDivider === 'list' ? 'w-[2px]' : ''}`} />
              </div>
            ) : null}
          </div>

          <div className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${(!selectedThreadId && isMobileLayout) ? 'hidden' : ''}`}>
            <ThreadView
              thread={selectedThread}
              messages={selectedThreadMessages}
              loading={threadLoading}
              error={threadError}
              folder={folder}
              onBack={() => navigate('/mailbox' + location.search)}
              onRetry={() => setThreadRetryKey((value) => value + 1)}
              onNavigateThread={(id) => navigate(`/mailbox/${id}${location.search}`)}
              canNavigatePrevious={navigationThreadIds.indexOf(selectedThreadId || -1) > 0}
              canNavigateNext={navigationThreadIds.indexOf(selectedThreadId || -1) >= 0 && navigationThreadIds.indexOf(selectedThreadId || -1) < navigationThreadIds.length - 1}
              previousThreadId={navigationThreadIds[navigationThreadIds.indexOf(selectedThreadId || -1) - 1]}
              nextThreadId={navigationThreadIds[navigationThreadIds.indexOf(selectedThreadId || -1) + 1]}
              isDark={isDark}
            />
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
