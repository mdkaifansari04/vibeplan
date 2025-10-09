"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: "user" | "ai" | "system";
  status?: "pending" | "success" | "error";
}

export interface MessagesState {
  messages: Message[];
  isLoading: boolean;

  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState = {
  messages: [],
  isLoading: false,
};

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: generateId(),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((message) => (message.id === id ? { ...message, ...updates } : message)),
        }));
      },

      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "vibeplan-messages",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);

// Selector hooks for better performance
export const useMessages = () => useMessagesStore((state) => state.messages);
export const useMessagesLoading = () => useMessagesStore((state) => state.isLoading);
export const useMessagesActions = () =>
  useMessagesStore((state) => ({
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    removeMessage: state.removeMessage,
    clearMessages: state.clearMessages,
    setLoading: state.setLoading,
  }));
