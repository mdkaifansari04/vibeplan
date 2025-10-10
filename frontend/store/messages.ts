import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  type: "user" | "ai";
  message: string;
}

export interface MessagesState {
  messages: Message[];
  addMessage: (message: Message) => void;
  resetMessages: () => void;
}

const initialState = {
  messages: [],
};

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      resetMessages: () => {
        set({ messages: [] });
      },
    }),
    {
      name: "vibeplan-messages",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
