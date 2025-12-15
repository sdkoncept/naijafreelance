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
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
      {isOpen && (
        <>
          {/* Backdrop for focus/contrast; click to close */}
          <div
            className="fixed inset-0 bg-black/35 backdrop-blur-[1px] z-40"
            onClick={() => setIsOpen(false)}
          />
          <AIChatbot onClose={() => setIsOpen(false)} />
        </>
      )}
    </>
  );
}

