'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useMessagingStore, MessageUser } from '@/store/messagingStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Plus, Send, Users, MessageSquare, Search } from 'lucide-react';

const timeShort = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dayShort = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return timeShort(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

type ComposeMode = null | 'direct' | 'group';

interface MessagingViewProps {
  role: 'admin' | 'super-admin' | 'student';
}

export function MessagingView({ role }: MessagingViewProps) {
  const { user } = useAuthStore();
  const {
    conversations, activeConversationId, messages,
    fetchConversations, openConversation, sendMessage, startDirectConversation,
    startGroupConversation, searchUsers, searchResults, isLoadingMessages,
  } = useMessagingStore();

  const [composeMode, setComposeMode] = useState<ComposeMode>(null);
  const [query, setQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<MessageUser[]>([]);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canCreateGroup = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (composeMode) searchUsers(query);
  }, [query, composeMode, searchUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const resetCompose = () => {
    setComposeMode(null);
    setQuery('');
    setGroupName('');
    setSelectedMembers([]);
  };

  const handleStartDirect = async (targetUser: MessageUser) => {
    const id = await startDirectConversation(targetUser.id);
    resetCompose();
    openConversation(id);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    const id = await startGroupConversation(groupName.trim(), selectedMembers.map((m) => m.id));
    resetCompose();
    openConversation(id);
  };

  const toggleMember = (u: MessageUser) => {
    setSelectedMembers((prev) => prev.some((m) => m.id === u.id) ? prev.filter((m) => m.id !== u.id) : [...prev, u]);
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    const text = draft;
    setDraft('');
    await sendMessage(text);
  };

  const showChatOnMobile = !!activeConversationId || !!composeMode;

  return (
    <div className="space-y-6 pb-10 h-full flex flex-col">
      <PageHeader
        title="Messages"
        description="Direct messages and group announcements."
        breadcrumbs={[
          { label: role === 'super-admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Student', href: `/${role}/dashboard` },
          { label: 'Messages' },
        ]}
        showSearch={false}
      />

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1 min-h-[600px] overflow-hidden p-0">
        <div className="flex h-full min-h-0">
          {/* Conversation list */}
          <div className={`w-full sm:w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col ${showChatOnMobile ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setComposeMode('direct')}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> New Message
              </Button>
              {canCreateGroup && (
                <Button size="sm" variant="outline" onClick={() => setComposeMode('group')}>
                  <Users className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">No conversations yet.</div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`w-full text-left p-3 flex items-start gap-3 border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${activeConversationId === c.id ? 'bg-slate-100 dark:bg-slate-900' : ''}`}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={c.type === 'GROUP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                        {c.type === 'GROUP' ? <Users className="w-4 h-4" /> : c.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${c.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{c.name}</span>
                        {c.lastMessage && <span className="text-[10px] text-slate-400 shrink-0">{dayShort(c.lastMessage.createdAt)}</span>}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 truncate">
                          {c.lastMessage ? `${c.lastMessage.isMine ? 'You: ' : ''}${c.lastMessage.text}` : 'No messages yet'}
                        </span>
                        {c.unreadCount > 0 && (
                          <Badge className="h-5 min-w-5 px-1.5 bg-blue-600 text-white border-0 shrink-0">{c.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right pane: compose or chat */}
          <div className={`flex-1 flex flex-col min-w-0 ${showChatOnMobile ? 'flex' : 'hidden sm:flex'}`}>
            {composeMode ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" onClick={resetCompose}><ArrowLeft className="w-4 h-4" /></Button>
                  <span className="font-semibold text-sm">{composeMode === 'group' ? 'New Group' : 'New Message'}</span>
                </div>
                {composeMode === 'group' && (
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                    <Input placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                    {selectedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMembers.map((m) => (
                          <Badge key={m.id} variant="secondary" className="cursor-pointer" onClick={() => toggleMember(m)}>{m.name} ×</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 relative">
                  <Search className="absolute left-6 top-6 h-4 w-4 text-slate-400" />
                  <Input className="pl-9" placeholder="Search by name or email..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400">
                      {query ? 'No matching users found.' : 'Start typing to search for people you can message.'}
                    </div>
                  ) : (
                    searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => composeMode === 'group' ? toggleMember(u) : handleStartDirect(u)}
                        className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
                      >
                        {composeMode === 'group' && (
                          <Checkbox checked={selectedMembers.some((m) => m.id === u.id)} onCheckedChange={() => toggleMember(u)} />
                        )}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-slate-100 text-slate-600">{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{u.role.replace('_', ' ')}</Badge>
                      </div>
                    ))
                  )}
                </div>
                {composeMode === 'group' && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                    <Button className="w-full" disabled={!groupName.trim() || selectedMembers.length === 0} onClick={handleCreateGroup}>
                      Create Group ({selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''})
                    </Button>
                  </div>
                )}
              </div>
            ) : activeConversation ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" onClick={() => useMessagingStore.setState({ activeConversationId: null })}><ArrowLeft className="w-4 h-4" /></Button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={activeConversation.type === 'GROUP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                      {activeConversation.type === 'GROUP' ? <Users className="w-4 h-4" /> : activeConversation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{activeConversation.name}</p>
                    {activeConversation.type === 'GROUP' && (
                      <p className="text-xs text-slate-500">{activeConversation.participants.length} members</p>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoadingMessages ? (
                    <div className="text-center text-sm text-slate-400">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-slate-400">No messages yet. Say hello!</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${m.isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'}`}>
                          {!m.isMine && activeConversation.type === 'GROUP' && (
                            <p className="text-[11px] font-semibold opacity-70 mb-0.5">{m.senderName}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                          <p className={`text-[10px] mt-1 ${m.isMine ? 'text-blue-100' : 'text-slate-400'}`}>{timeShort(m.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
                  <Input
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <Button size="icon" onClick={handleSend} disabled={!draft.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 hidden sm:flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                Select a conversation or start a new one.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
