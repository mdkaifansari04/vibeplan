// components/message-component.tsx

import React from "react";
import { MessageSquare, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/store/messages";
import { MessageSquareDashed } from "../animate-ui/icons/message-square-dashed";
import { AnimateIcon } from "../animate-ui/icons/icon";

interface MessageComponentProps {
  message: Message;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  const getMessageDisplay = () => {
    switch (message.type) {
      case "user":
        return {
          icon: <MessageSquare size={16} className="text-neutral-600 dark:text-neutral-400" />,
          label: "Your Request",
          bgClass: "bg-sidebar border border-neutral-200 dark:border-neutral-700",
        };

      case "ai":
        return {
          icon: <Sparkles size={16} className="text-purple-500 dark:text-purple-400" />,
          label: "Phase Generation",
          bgClass: "bg-sidebar border border-purple-200 dark:border-purple-800/50",
        };

      default:
        return {
          icon: <MessageSquare size={16} className="text-neutral-500" />,
          label: "Message",
          bgClass: "bg-sidebar border border-neutral-200 dark:border-neutral-700",
        };
    }
  };

  const display = getMessageDisplay();

  return (
    <div className={cn("group rounded-lg shadow-sm transition-all duration-200", "hover:shadow-md hover:scale-[1.01]", display.bgClass)}>
      <AnimateIcon animateOnHover>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
          <MessageSquareDashed className={"w-5"} />
          {/* <div className="flex-shrink-0">{display.icon}</div> */}
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{display.label}</span>
        </div>
      </AnimateIcon>

      <div className="px-4 py-3">
        <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">{message.message}</p>

        {/* {message.metadata && (
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              {message.metadata.phaseCount && <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{message.metadata.phaseCount} phases generated</span>}
              {message.metadata.contextFiles && <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{message.metadata.contextFiles} files analyzed</span>}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default MessageComponent;
