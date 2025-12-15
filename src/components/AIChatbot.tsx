import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const knowledgeBase: Record<string, string> = {
  "what is naijafreelance": "NaijaFreelance is a Nigerian freelance marketplace that connects clients with talented freelancers. You can hire freelancers for various services or offer your services as a freelancer.",
  "how do i sign up": "You can sign up by clicking the 'Sign Up' button on the homepage or going to /auth. You can choose to be a client (to hire freelancers) or a freelancer (to offer services). You can also sign up with your Google account!",
  "how do i post a job": "As a client, you can post a job by clicking 'Post a Job' in the navigation menu. Fill in the job details, requirements, budget, and deadline.",
  "how do i create a gig": "As a freelancer, go to your dashboard and click 'Create Gig'. Fill in your service details, set up packages (Basic, Standard, Premium), and add pricing.",
  "how does payment work": "When you place an order, payment is held in escrow until the work is completed. Once you accept the delivery, payment is released to the freelancer. We use Paystack for secure payments.",
  "what is escrow": "Escrow is a secure payment system where your payment is held by the platform until the work is completed and you're satisfied. This protects both clients and freelancers.",
  "how do i become verified": "Clients need to be verified before they can purchase gigs. Click 'Verify Me' when prompted, and an admin will review your account. You can still browse and contact freelancers while unverified.",
  "how do i withdraw earnings": "Freelancers can withdraw earnings from the Earnings page. Click 'Request Withdrawal', enter your bank details, and submit. Withdrawals are processed within 3-5 business days.",
  "what are the fees": "The platform charges a 20% commission on orders. There's also a 1.5% platform fee and ₦100 processing fee on payments.",
  "how do i contact support": "You can visit the Help Center or Contact Us page. You can also message admins directly through the messaging system.",
  "how do reviews work": "After completing an order, clients can leave a review and rating (1-5 stars) for the freelancer. Reviews help build trust and reputation.",
  "what is the community": "The Community is a forum where freelancers can share tips, ask questions, network, and help each other. Only freelancers can access the community.",
  "how do i track my order": "Go to 'My Gigs' to see all your orders. Click on any order to see detailed tracking with status updates and timeline.",
  "can i request revisions": "Yes! When a freelancer delivers work, you can request revisions. This changes the order status back to 'in progress'.",
  "what happens if i cancel": "Cancellation policies depend on the order status. Contact support or the freelancer if you need to cancel an order.",
};

const greetings = [
  "Hello! How can I help you today?",
  "Hi there! What would you like to know about NaijaFreelance?",
  "Welcome! I'm here to help. What questions do you have?",
];

const defaultResponses = [
  "I understand you're asking about that. Could you rephrase your question?",
  "I'm not sure about that specific detail. Try asking about: signing up, posting jobs, creating gigs, payments, or withdrawals.",
  "Let me help you better. You can ask me about: how the platform works, how to sign up, payment methods, or account verification.",
];

function findBestMatch(query: string): string | null {
  const lowerQuery = query.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }
  
  // Check for keyword matches
  const keywords: Record<string, string> = {
    signup: knowledgeBase["how do i sign up"],
    sign: knowledgeBase["how do i sign up"],
    register: knowledgeBase["how do i sign up"],
    login: knowledgeBase["how do i sign up"],
    account: knowledgeBase["how do i sign up"],
    job: knowledgeBase["how do i post a job"],
    post: knowledgeBase["how do i post a job"],
    gig: knowledgeBase["how do i create a gig"],
    create: knowledgeBase["how do i create a gig"],
    payment: knowledgeBase["how does payment work"],
    pay: knowledgeBase["how does payment work"],
    money: knowledgeBase["how does payment work"],
    escrow: knowledgeBase["what is escrow"],
    withdraw: knowledgeBase["how do i withdraw earnings"],
    earnings: knowledgeBase["how do i withdraw earnings"],
    fee: knowledgeBase["what are the fees"],
    commission: knowledgeBase["what are the fees"],
    verified: knowledgeBase["how do i become verified"],
    verification: knowledgeBase["how do i become verified"],
    review: knowledgeBase["how do reviews work"],
    rating: knowledgeBase["how do reviews work"],
    community: knowledgeBase["what is the community"],
    track: knowledgeBase["how do i track my order"],
    order: knowledgeBase["how do i track my order"],
    revision: knowledgeBase["can i request revisions"],
    cancel: knowledgeBase["what happens if i cancel"],
    support: knowledgeBase["how do i contact support"],
    help: knowledgeBase["how do i contact support"],
  };
  
  for (const [keyword, response] of Object.entries(keywords)) {
    if (lowerQuery.includes(keyword)) {
      return response;
    }
  }
  
  return null;
}

function generateResponse(query: string): string {
  // Check for greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i.test(query)) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Check for thanks
  if (/^(thanks|thank you|thank|appreciate)/i.test(query)) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  // Find best match
  const match = findBestMatch(query);
  if (match) {
    return match;
  }
  
  // Default response
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

interface AIChatbotProps {
  onClose?: () => void;
}

export default function AIChatbot({ onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the NaijaFreelance assistant. I can help you with questions about the platform, how to sign up, payments, orders, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate thinking time
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] max-w-md sm:max-w-lg sm:w-96 h-[70vh] max-h-[700px] sm:h-[600px] shadow-2xl z-50 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-lg">NaijaFreelance Assistant</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4 pr-3 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 break-words ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about NaijaFreelance..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

