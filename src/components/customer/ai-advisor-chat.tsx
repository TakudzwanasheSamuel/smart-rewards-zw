"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { customerAdvisorApi } from '@/lib/api';
import { quickHelpTopics } from '@/lib/customer-help-data';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  MessageCircle,
  TrendingUp,
  Gift,
  Users,
  Star,
  Lightbulb,
  Store,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  quickActions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  dataInsights?: {
    currentPoints?: number;
    tier?: string;
    potentialSavings?: string;
    nextMilestone?: string;
  };
}

interface QuickTopicProps {
  topic: typeof quickHelpTopics[0];
  onSelect: (topic: string) => void;
  isLoading: boolean;
}

function QuickTopic({ topic, onSelect, isLoading }: QuickTopicProps) {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent transition-colors border-dashed" 
      onClick={() => !isLoading && onSelect(topic.title)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{topic.icon}</div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{topic.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-blue-100 text-blue-600'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`p-3 rounded-lg ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Data Insights */}
        {message.dataInsights && !isUser && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Your Current Status</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {message.dataInsights.currentPoints !== undefined && (
                <div>
                  <span className="text-muted-foreground">Points: </span>
                  <span className="font-medium">{message.dataInsights.currentPoints}</span>
                </div>
              )}
              {message.dataInsights.tier && (
                <div>
                  <span className="text-muted-foreground">Tier: </span>
                  <Badge variant="outline" className="text-xs">{message.dataInsights.tier}</Badge>
                </div>
              )}
              {message.dataInsights.potentialSavings && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Savings Available: </span>
                  <span className="text-green-600 font-medium">{message.dataInsights.potentialSavings}</span>
                </div>
              )}
              {message.dataInsights.nextMilestone && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Next Goal: </span>
                  <span className="font-medium">{message.dataInsights.nextMilestone}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {message.recommendations && message.recommendations.length > 0 && !isUser && (
          <div className="mt-2 space-y-2">
            {message.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {rec.type === 'offer' ? <Gift className="h-3 w-3" /> :
                     rec.type === 'business' ? <Store className="h-3 w-3" /> :
                     rec.type === 'mukando' ? <Users className="h-3 w-3" /> :
                     <Star className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-green-800">{rec.title}</h5>
                    <p className="text-xs text-green-700 mt-1">{rec.description}</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs h-6">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && !isUser && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.quickActions.map((action, index) => (
              <Button key={index} size="sm" variant="outline" className="text-xs h-7">
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default function AiAdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickTopics, setShowQuickTopics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm Takudzwanashe, your Smart Rewards AI advisor! 🌟\n\nI'm here to help you make the most of your loyalty program. I can help you:\n\n• Find the best offers and deals\n• Discover new businesses you'll love\n• Join Mukando savings groups\n• Plan your financial goals\n• Upgrade your tier status\n\nWhat would you like to know about today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleQuickTopic = async (topicTitle: string) => {
    setShowQuickTopics(false);
    await sendMessage(topicTitle);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationContext = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await customerAdvisorApi.chat(text, {
        conversationContext,
        requestType: 'general'
      });

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          recommendations: response.data.recommendations,
          quickActions: response.data.quickActions,
          dataInsights: response.data.dataInsights
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Sorry, I'm having trouble responding right now. Please try again!",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having some technical difficulties right now. Please try asking your question again, or contact support if the problem persists.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Advisor Chat
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {/* Quick Topics (shown initially) */}
            {showQuickTopics && messages.length <= 1 && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground text-center">
                  Choose a topic to get started:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {quickHelpTopics.slice(0, 4).map((topic) => (
                    <QuickTopic 
                      key={topic.id} 
                      topic={topic} 
                      onSelect={handleQuickTopic}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about Smart Rewards..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Powered by AI • Ask about offers, businesses, savings tips & more
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
