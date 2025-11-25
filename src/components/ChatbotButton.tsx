import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import AIChatbot from "./AIChatbot";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
      {isOpen && <AIChatbot onClose={() => setIsOpen(false)} />}
    </>
  );
}

