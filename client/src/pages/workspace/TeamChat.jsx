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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MessageSquare, Hash, Plus, Send, Pin, Smile, User } from 'lucide-react';

const TeamChat = () => {
  const { currentWorkspaceId, currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  // Fetch channels
  const { data: channelsData, isLoading: isChannelsLoading } = useQuery({
    queryKey: ['workspace-channels', currentWorkspaceId],
    queryFn: () => workspaceApi.getChannels(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const channels = channelsData?.channels || [];
  const selectedChannelId = activeChannelId || channels[0]?._id;

  // Fetch messages for selected channel
  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['workspace-messages', currentWorkspaceId, selectedChannelId],
    queryFn: () => workspaceApi.getMessages(currentWorkspaceId, { channelId: selectedChannelId }),
    enabled: !!currentWorkspaceId && !!selectedChannelId
  });

  const messages = messagesData?.messages || [];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedChannelId) return;

    try {
      await workspaceApi.sendMessage(currentWorkspaceId, {
        channelId: selectedChannelId,
        content: messageContent
      });
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['workspace-messages', currentWorkspaceId, selectedChannelId] });
    } catch (err) {
      showError('Failed to send message');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await workspaceApi.createChannel(currentWorkspaceId, { name: newChannelName });
      showSuccess('Channel created!');
      queryClient.invalidateQueries({ queryKey: ['workspace-channels', currentWorkspaceId] });
      setIsCreateChannelModalOpen(false);
      setNewChannelName('');
    } catch (err) {
      showError('Failed to create channel');
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await workspaceApi.addReaction(currentWorkspaceId, messageId, { emoji });
      queryClient.invalidateQueries({ queryKey: ['workspace-messages', currentWorkspaceId, selectedChannelId] });
    } catch (err) {
      showError('Failed to react');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Chat & Channels"
        subtitle="Real-time collaboration channels, direct messages, reactions, pinned notes, and walkie-talkie logs"
        icon={MessageSquare}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
        {/* Left Channels Sidebar */}
        <Card className="p-4 flex flex-col justify-between space-y-4 md:col-span-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-planner-muted uppercase tracking-wider">Channels</h3>
              <button onClick={() => setIsCreateChannelModalOpen(true)} className="p-1 hover:bg-planner-secondary rounded-lg text-planner-muted">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {channels.map((ch) => (
                <button
                  key={ch._id}
                  onClick={() => setActiveChannelId(ch._id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedChannelId === ch._id
                      ? 'bg-planner-primary text-white'
                      : 'text-planner-text hover:bg-planner-secondary'
                  }`}
                >
                  <Hash className="w-4 h-4 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Chat Message Main Area */}
        <Card className="p-4 flex flex-col justify-between md:col-span-3">
          {/* Channel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-planner-border">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-planner-primary" />
              <h3 className="text-sm font-bold text-planner-text">
                {channels.find((c) => c._id === selectedChannelId)?.name || 'general'}
              </h3>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {isMessagesLoading ? (
              <LoadingSpinner message="Loading messages..." />
            ) : messages.length === 0 ? (
              <p className="text-xs text-planner-muted text-center py-8">No messages in this channel yet. Say hello 👋</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {msg.sender?.avatar ? (
                      <img src={msg.sender.avatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                    ) : (
                      msg.sender?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-planner-text">{msg.sender?.name || 'User'}</span>
                      <span className="text-[10px] text-planner-muted">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-planner-text bg-planner-bg/60 p-2.5 rounded-xl border border-planner-border leading-relaxed inline-block max-w-xl">
                      {msg.content}
                    </p>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {['👍', '❤️', '🎉', '🚀'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(msg._id, emoji)}
                          className="px-1.5 py-0.5 rounded-lg border border-planner-border text-[10px] hover:bg-planner-secondary transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-planner-border flex gap-2">
            <Input
              placeholder={`Message #${channels.find((c) => c._id === selectedChannelId)?.name || 'general'}...`}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>

      {/* Create Channel Modal */}
      <Modal isOpen={isCreateChannelModalOpen} onClose={() => setIsCreateChannelModalOpen(false)} title="Create New Channel 💬">
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <Input label="Channel Name" placeholder="e.g. development" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} required autoFocus />
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
