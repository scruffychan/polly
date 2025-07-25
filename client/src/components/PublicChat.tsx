import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle } from "lucide-react";
import SentimentMeter from "@/components/SentimentMeter";

interface ChatMessage {
  id: number;
  content: string;
  sentiment?: number;
  hasCommonGroundBadge: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImageUrl?: string;
  };
}

interface PublicChatProps {
  questionId: number;
}

export default function PublicChat({ questionId }: PublicChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sentiment, setSentiment] = useState({ avgSentiment: 0, positivePercentage: 50 });
  const [activeUsers, setActiveUsers] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages } = useQuery({
    queryKey: ["/api/chat", questionId],
    enabled: !!questionId,
  });

  useEffect(() => {
    if (initialMessages) {
      // Sort initial messages by timestamp, oldest first
      const sortedMessages = initialMessages.sort((a: ChatMessage, b: ChatMessage) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!user || !questionId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'join',
        userId: user.id,
        questionId: questionId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_history') {
        // Sort messages by timestamp, oldest first
        const sortedMessages = data.messages.sort((a: ChatMessage, b: ChatMessage) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      } else if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'sentiment_update') {
        setSentiment({
          avgSentiment: data.avgSentiment,
          positivePercentage: data.positivePercentage
        });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [user, questionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !user) return;

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        content: newMessage.trim()
      }));
      setNewMessage("");
    } else {
      toast({
        title: "Connection error",
        description: "Unable to send message. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (messageUser: ChatMessage['user']) => {
    if (messageUser.firstName) {
      return `${messageUser.firstName} ${messageUser.lastName || ''}`.trim();
    }
    return messageUser.email?.split('@')[0] || 'Anonymous';
  };

  const getUserInitials = (messageUser: ChatMessage['user']) => {
    if (messageUser.firstName) {
      return `${messageUser.firstName[0]}${messageUser.lastName?.[0] || ''}`;
    }
    return messageUser.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text flex items-center">
            <MessageCircle className="text-primary mr-2 w-5 h-5" />
            Public Discussion
          </h3>
          
          <SentimentMeter 
            avgSentiment={sentiment.avgSentiment}
            positivePercentage={sentiment.positivePercentage}
          />
        </div>



        {/* Chat Messages */}
        <div 
          className="border border-gray-200 rounded-lg mb-4 p-4 space-y-4 overflow-y-auto"
          style={{ height: '300px' }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50 mx-auto" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: message.user.profileImageUrl 
                        ? `url(${message.user.profileImageUrl})` 
                        : undefined 
                    }}
                  >
                    {!message.user.profileImageUrl && (
                      <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {getUserInitials(message.user)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {getUserDisplayName(message.user)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.createdAt)}
                      </span>
                      {message.hasCommonGroundBadge && (
                        <span className="bg-accent text-white px-2 py-0.5 rounded-full text-xs">
                          Common Ground
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {user ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your perspective respectfully..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </Button>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{messages.length} messages in discussion</span>
              <span>Messages are moderated for constructive dialogue</span>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">Sign in to join the discussion</p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-blue-600"
            >
              Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
