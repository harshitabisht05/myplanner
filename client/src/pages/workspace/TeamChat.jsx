import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Checkbox from '../../components/common/Checkbox';
import { useSocket } from '../../hooks/useSocket';
import { MessageSquare, Hash, Plus, Send, Pin, Smile, User, Lock, Users, Radio } from 'lucide-react';

const TeamChat = () => {
  const { currentWorkspaceId, currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [activeChannelId, setActiveChannelId] = useState(null);
  const [activeRecipientId, setActiveRecipientId] = useState(null);

  const [messageContent, setMessageContent] = useState('');
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Connect socket for real-time live chat updates
  useSocket(currentWorkspaceId, (event) => {
    if (event === 'chat_message' || event === 'chat_reaction') {
      queryClient.invalidateQueries({
        queryKey: ['workspace-messages', currentWorkspaceId]
      });
    }
  });

  // Fetch channels
  const { data: channelsData, isLoading: isChannelsLoading } = useQuery({
    queryKey: ['workspace-channels', currentWorkspaceId],
    queryFn: () => workspaceApi.getChannels(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const channels = channelsData?.channels || [];
  const selectedChannelId = !activeRecipientId ? (activeChannelId || channels[0]?._id) : null;

  // Fetch messages for selected channel or DM recipient
  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['workspace-messages', currentWorkspaceId, selectedChannelId, activeRecipientId],
    queryFn: () =>
      workspaceApi.getMessages(
        currentWorkspaceId,
        selectedChannelId ? { channelId: selectedChannelId } : { recipientId: activeRecipientId }
      ),
    enabled: !!currentWorkspaceId && (!!selectedChannelId || !!activeRecipientId)
  });

  const messages = messagesData?.messages || [];
  const members = currentWorkspace?.members || [];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      await workspaceApi.sendMessage(currentWorkspaceId, {
        channelId: selectedChannelId,
        recipientId: activeRecipientId,
        content: messageContent
      });
      setMessageContent('');
      queryClient.invalidateQueries({
        queryKey: ['workspace-messages', currentWorkspaceId, selectedChannelId, activeRecipientId]
      });
    } catch (err) {
      showError('Failed to send message');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await workspaceApi.createChannel(currentWorkspaceId, {
        name: newChannelName,
        description: newChannelDesc,
        isPrivate,
        memberIds: selectedMemberIds
      });
      showSuccess('Group Channel created!');
      queryClient.invalidateQueries({ queryKey: ['workspace-channels', currentWorkspaceId] });
      setIsCreateChannelModalOpen(false);
      setNewChannelName('');
      setNewChannelDesc('');
      setIsPrivate(false);
      setSelectedMemberIds([]);
    } catch (err) {
      showError('Failed to create channel');
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await workspaceApi.addReaction(currentWorkspaceId, messageId, { emoji });
      queryClient.invalidateQueries({
        queryKey: ['workspace-messages', currentWorkspaceId, selectedChannelId, activeRecipientId]
      });
    } catch (err) {
      showError('Failed to react');
    }
  };

  const toggleMemberSelection = (memberUserId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberUserId) ? prev.filter((id) => id !== memberUserId) : [...prev, memberUserId]
    );
  };

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const activeRecipientMember = members.find((m) => (m.user?._id || m.user) === activeRecipientId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Chat & Messaging"
        subtitle="Group channels, private DMs with team members, emoji reactions, and walkie-talkie logs"
        icon={MessageSquare}
        action={
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileSidebar((prev) => !prev)}
          >
            <Users className="w-4 h-4 mr-1.5" /> Channels & DMs
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[620px]">
        {/* Left Sidebar: Channels & Direct Messages */}
        <Card className={`p-4 flex flex-col justify-between space-y-4 md:col-span-1 overflow-y-auto ${showMobileSidebar ? 'block' : 'hidden md:flex'}`}>
          <div className="space-y-4">
            {/* Channels Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-planner-muted uppercase tracking-wider">Group Channels</h3>
                <button
                  onClick={() => setIsCreateChannelModalOpen(true)}
                  className="p-1 hover:bg-planner-secondary rounded-lg text-planner-muted hover:text-planner-primary"
                  title="Create New Channel"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {channels.map((ch) => (
                  <button
                    key={ch._id}
                    onClick={() => {
                      setActiveChannelId(ch._id);
                      setActiveRecipientId(null);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedChannelId === ch._id
                        ? 'bg-planner-primary text-white shadow-xs'
                        : 'text-planner-text hover:bg-planner-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {ch.isPrivate ? <Lock className="w-3.5 h-3.5 shrink-0" /> : <Hash className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{ch.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages Section */}
            <div className="space-y-2 pt-2 border-t border-planner-border">
              <h3 className="text-xs font-black text-planner-muted uppercase tracking-wider">Direct Messages</h3>
              <div className="space-y-1">
                {members
                  .filter((m) => (m.user?._id || m.user) !== user?._id)
                  .map((m) => {
                    const memberId = m.user?._id || m.user;
                    const isSelected = activeRecipientId === memberId;
                    return (
                      <button
                        key={memberId}
                        onClick={() => {
                          setActiveRecipientId(memberId);
                          setActiveChannelId(null);
                          setShowMobileSidebar(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected ? 'bg-purple-600 text-white shadow-xs' : 'text-planner-text hover:bg-planner-secondary'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="truncate">{m.user?.name || 'Member'}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </Card>

        {/* Right Chat Message Main Area */}
        <Card className="p-4 flex flex-col justify-between md:col-span-3">
          {/* Active Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-planner-border">
            <div className="flex items-center gap-2">
              {activeRecipientId ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    {activeRecipientMember?.user?.name ? activeRecipientMember.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-planner-text">{activeRecipientMember?.user?.name || 'Direct Message'}</h3>
                    <p className="text-[10px] text-planner-muted">Private 1-on-1 Conversation</p>
                  </div>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5 text-planner-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-planner-text">
                      {channels.find((c) => c._id === selectedChannelId)?.name || 'general'}
                    </h3>
                    <p className="text-[10px] text-planner-muted">
                      {channels.find((c) => c._id === selectedChannelId)?.description || 'Group discussion channel'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {isMessagesLoading ? (
              <Skeleton variant="task" count={4} />
            ) : messages.length === 0 ? (
              <EmptyState type="messages" title="No messages yet" message="Start the conversation with your team members! 👋" />
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === user?._id;
                return (
                  <div key={msg._id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {msg.sender?.name ? msg.sender.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className={`space-y-1 max-w-[75%] ${isMe ? 'items-end text-right' : ''}`}>
                      <div className="flex items-center gap-2 text-[11px] text-planner-muted">
                        <span className="font-bold text-planner-text">{msg.sender?.name || 'Teammate'}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs font-medium inline-block text-left ${
                          isMe ? 'bg-planner-primary text-white' : 'bg-planner-secondary text-planner-text'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Emoji Reactions */}
                      <div className="flex gap-1 pt-1 flex-wrap">
                        {['👍', '❤️', '🎉', '🚀'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg._id, emoji)}
                            className="px-1.5 py-0.5 rounded-full text-[10px] bg-planner-bg border border-planner-border hover:bg-planner-secondary"
                          >
                            {emoji}{' '}
                            {msg.reactions?.find((r) => r.emoji === emoji)?.users?.length || ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-planner-border">
            <Input
              placeholder={activeRecipientId ? `Message ${activeRecipientMember?.user?.name || 'member'}...` : 'Type a message...'}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" variant="primary">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>

      {/* Create Group Channel Modal with Member Selector */}
      <Modal isOpen={isCreateChannelModalOpen} onClose={() => setIsCreateChannelModalOpen(false)} title="Create Group Channel 💬">
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <Input label="Channel Name" placeholder="e.g. design-team, frontend-bugs" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} required autoFocus />
          <Input label="Description (Optional)" placeholder="What is this channel for?" value={newChannelDesc} onChange={(e) => setNewChannelDesc(e.target.value)} />
          <div className="flex items-center gap-2">
            <Checkbox checked={isPrivate} onChange={setIsPrivate} label="Make Channel Private" />
          </div>

          {/* Member Selection for Channel */}
          <div className="space-y-2 pt-2 border-t border-planner-border">
            <label className="text-xs font-bold text-planner-muted block">Add Specific Members to Group (Optional)</label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-planner-bg border border-planner-border">
              {members.map((m) => {
                const memberId = m.user?._id || m.user;
                return (
                  <div key={memberId} className="flex items-center justify-between p-1.5 hover:bg-planner-card rounded-lg">
                    <span className="text-xs font-semibold text-planner-text">{m.user?.name || 'Member'} ({m.role})</span>
                    <Checkbox
                      checked={selectedMemberIds.includes(memberId)}
                      onChange={() => toggleMemberSelection(memberId)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateChannelModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Channel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamChat;
