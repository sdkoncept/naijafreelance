import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, MessageSquare, Search, Paperclip, Image as ImageIcon, File } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  order_id: string | null;
  read_at: string | null;
  created_at: string;
  sender: {
    full_name: string;
    avatar_url?: string;
  };
  receiver: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Check if user parameter is in URL (for direct messaging)
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId && user?.id && userId !== user.id) {
      setSelectedConversation(userId);
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id},receiver_id=eq.${user.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchMessages = async () => {
    try {
      if (!user?.id) return;

      // Try to fetch messages, but handle if table doesn't exist
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey (
              full_name,
              avatar_url
            ),
            receiver:profiles!messages_receiver_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const transformedMessages = (data || []).map((msg: any) => ({
          ...msg,
          sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
          receiver: Array.isArray(msg.receiver) ? msg.receiver[0] : msg.receiver,
        }));

        setMessages(transformedMessages);
      } catch (error: any) {
        if (error.code === "PGRST205") {
          // Messages table doesn't exist yet
          console.log("Messages table not available");
          setMessages([]);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh messages to show the new one
      await fetchMessages();
      setNewMessage("");
      toast.success("Message sent!");
    } catch (error: any) {
      console.error("Error sending message:", error);
      if (error.code === "PGRST205") {
        toast.error("Messaging table not available. Please run the migration.");
      } else {
        toast.error("Failed to send message: " + error.message);
      }
    } finally {
      setSending(false);
    }
  };

  // Group messages by conversation (other user)
  const conversations = messages.reduce((acc, msg) => {
    const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        userName: msg.sender_id === user?.id ? msg.receiver?.full_name : msg.sender?.full_name,
        avatar: msg.sender_id === user?.id ? msg.receiver?.avatar_url : msg.sender?.avatar_url,
        lastMessage: msg,
        unread: msg.receiver_id === user?.id && !msg.read_at,
      };
    }
    return acc;
  }, {} as Record<string, any>);

  // Get conversation messages sorted by time
  const conversationMessages = selectedConversation
    ? messages
        .filter(
          (msg) =>
            (msg.sender_id === user?.id && msg.receiver_id === selectedConversation) ||
            (msg.receiver_id === user?.id && msg.sender_id === selectedConversation)
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with freelancers and clients</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Conversations List */}
        <Card className="overflow-hidden border-gray-200">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {Object.values(conversations).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Start a conversation from an order or gig</p>
                </div>
              ) : (
                <div className="divide-y">
                  {Object.values(conversations).map((conv: any) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedConversation(conv.userId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                        selectedConversation === conv.userId
                          ? "bg-primary/5 border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-gray-200">
                          <AvatarImage src={conv.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {conv.userName?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">{conv.userName}</p>
                            {conv.unread && (
                              <Badge className="h-2 w-2 p-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="md:col-span-2 overflow-hidden border-gray-200">
          <CardContent className="p-0 h-full flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-gray-200">
                      <AvatarImage
                        src={conversations[selectedConversation]?.avatar}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {conversations[selectedConversation]?.userName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {conversations[selectedConversation]?.userName}
                      </p>
                      <p className="text-xs text-gray-500">Active now</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {conversationMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    conversationMessages.map((msg, index) => {
                      const isOwn = msg.sender_id === user?.id;
                      const showAvatar = index === 0 || conversationMessages[index - 1].sender_id !== msg.sender_id;
                      const showTime = index === conversationMessages.length - 1 || 
                        new Date(msg.created_at).getTime() - new Date(conversationMessages[index + 1].created_at).getTime() > 300000; // 5 minutes

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isOwn && showAvatar && (
                            <Avatar className="h-8 w-8 border border-gray-200">
                              <AvatarImage src={msg.sender?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {msg.sender?.full_name?.charAt(0)?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isOwn && !showAvatar && <div className="w-8" />}
                          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? "bg-primary text-white rounded-br-sm"
                                  : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {showTime && (
                              <p className={`text-xs mt-1 px-2 ${isOwn ? "text-gray-500" : "text-gray-400"}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      title="Attach file"
                    >
                      <Paperclip className="h-5 w-5 text-gray-500" />
                    </Button>
                    <div className="flex-1 relative">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="resize-none min-h-[44px] max-h-32 pr-12"
                        rows={1}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 flex-shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <MessageSquare className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

