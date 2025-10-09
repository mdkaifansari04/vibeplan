import React from "react";
import { User, Bot, Info, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/store/messages";

interface MessageComponentProps {
  message: Message;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  const getMessageIcon = () => {
    switch (message.type) {
      case "user":
        return <User size={16} className="text-blue-500 dark:text-blue-400" />;
      case "ai":
        return <Bot size={16} className="text-emerald-500 dark:text-emerald-400" />;
      case "system":
        return <Info size={16} className="text-gray-500 dark:text-gray-400" />;
      default:
        return <Info size={16} className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "pending":
        return <Clock size={12} className="text-yellow-500 dark:text-yellow-400 animate-pulse" />;
      case "success":
        return <CheckCircle size={12} className="text-green-500 dark:text-green-400" />;
      case "error":
        return <XCircle size={12} className="text-red-500 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getTimeString = () => {
    const now = new Date();
    const messageTime = new Date(message.timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  return (
    <div className={cn("group flex gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50", message.type === "user" && "bg-blue-50/50 dark:bg-blue-950/20", message.type === "ai" && "bg-emerald-50/50 dark:bg-emerald-950/20", message.type === "system" && "bg-gray-50/50 dark:bg-gray-800/20")}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getMessageIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-xs font-medium capitalize", message.type === "user" && "text-blue-600 dark:text-blue-400", message.type === "ai" && "text-emerald-600 dark:text-emerald-400", message.type === "system" && "text-gray-600 dark:text-gray-400")}>{message.type}</span>
          {message.status && getStatusIcon()}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{getTimeString()}</span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageComponent;
