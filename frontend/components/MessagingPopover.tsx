import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { 
  Send, 
  MessageCircle, 
  X, 
  Phone, 
  Video, 
  MoreHorizontal,
  Smile,
  Paperclip,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isCurrentUser: boolean;
}

interface MessagingUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface MessagingPopoverProps {
  user: MessagingUser;
  trigger: React.ReactNode;
  onClose?: () => void;
}

// Mock message data
const mockMessages: Message[] = [];

function MessagingPopover({ user, trigger, onClose }: MessagingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus textarea when popover opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
      isCurrentUser: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response (optional)
      // You could add auto-response logic here
    }, 1500);

    toast.success('Message sent successfully!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-[#021ff6]" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 h-[600px] p-0 popout-shadow" 
        side="left"
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {user.isOnline ? 'Active now' : `Last seen ${user.lastSeen || '1 hour ago'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
                
                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="flex items-center gap-2 my-4">
                        <Separator className="flex-1" />
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(message.timestamp)}
                        </Badge>
                        <Separator className="flex-1" />
                      </div>
                    )}
                    
                    <div className={`flex gap-3 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      {!message.isCurrentUser && (
                        <Avatar className="h-6 w-6 mt-1">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${message.isCurrentUser ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                          message.isCurrentUser 
                            ? 'bg-[#021ff6] text-white' 
                            : 'bg-muted text-foreground'
                        }`}>
                          {message.content}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                          message.isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {message.isCurrentUser && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="min-h-[40px] max-h-[120px] resize-none border-0 bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={1}
                />
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="h-8 w-8 p-0 flex-shrink-0 bg-[#021ff6] hover:bg-[#021ff6]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MessagingPopover };
export type { MessagingUser };