import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, MessageSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchMessages();
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
      // For now, just show a message that messaging will be implemented
      toast.info("Messaging feature coming soon! Messages will be stored and synced in real-time.");
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with freelancers and clients</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
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
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation === conv.userId ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={conv.avatar} />
                          <AvatarFallback>
                            {conv.userName?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium truncate">{conv.userName}</p>
                            {conv.unread && (
                              <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.lastMessage.content}
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
        <Card className="md:col-span-2 overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          conversations[selectedConversation]?.avatar
                        }
                      />
                      <AvatarFallback>
                        {conversations[selectedConversation]?.userName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {conversations[selectedConversation]?.userName}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages
                    .filter(
                      (msg) =>
                        (msg.sender_id === user?.id &&
                          msg.receiver_id === selectedConversation) ||
                        (msg.receiver_id === user?.id &&
                          msg.sender_id === selectedConversation)
                    )
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === user?.id
                              ? "bg-slate-700 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender_id === user?.id
                                ? "text-slate-200"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
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
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

