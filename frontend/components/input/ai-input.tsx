"use client";
import React, { use, useState } from "react";
import { Image, BarChart2, MoreHorizontal, Send, LoaderCircle } from "lucide-react";
import { useGeneratePhases } from "@/hooks/mutation";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useMessagesStore } from "@/store/messages";
import { usePhaseStore } from "@/store/phase";

interface CreativeCardProps {
  placeholder?: string;
}

const AIInput: React.FC<CreativeCardProps> = ({ placeholder = "Type your creative idea here...✨" }) => {
  const { mutate: generatePhase, isPending } = useGeneratePhases();
  const { setPhases, setRelevantFiles, reset, setUserPrompt } = usePhaseStore();
  const { addMessage } = useMessagesStore();
  const params = useParams();
  const namespace = params.namespace as string;
  const [inputValue, setInputValue] = useState("");

  const handleGeneratePhase = () => {
    reset();
    const userPrompt = inputValue.trim();
    if (!userPrompt) return;

    const userMessageId = `user_${Date.now()}`;
    addMessage({
      message: userPrompt,
      type: "user",
    });
    generatePhase(
      {
        namespace,
        userPrompt,
        contextType: "improvement",
      },
      {
        onSuccess: (data) => {
          toast({
            title: "Phases Generated",
            description: "New phases have been generated based on your request.",
            duration: 5000,
          });

          console.log("daata", data);

          setPhases(data.phases);
          setRelevantFiles(data.contextSummary.topRelevantFiles);
          setUserPrompt(userPrompt);
          setInputValue("");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error?.message || "Something went wrong while generating phases.",
            duration: 5000,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGeneratePhase();
    }
  };
  return (
    <div className="w-full flex flex-col items-center mx-auto max-w-[350px] pb-1.5">
      <div className="w-full  p-[2px] overflow-hidden">
        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-radial from-white via-white/30 to-transparent blur-sm"></div>

        <div className="w-full flex flex-col dark:bg-black/50 bg-white/20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="w-full relative flex">
            <textarea id="chat_bot" name="chat_bot" placeholder={placeholder} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} disabled={isPending} className="bg-transparent rounded-xl border-none outline-none ring-0 w-full h-14 text-gray-900 dark:text-white font-sans text-sm font-medium p-3 resize-none placeholder-gray-600 dark:placeholder-gray-400 scrollbar-thin scrollbar-thumb-gray-500 dark:scrollbar-thumb-gray-700 scrollbar-thumb-rounded hover:scrollbar-thumb-gray-700 transition-all focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none active:ring-0 active:outline-none active:border-none disabled:opacity-50" />
          </div>

          <div className="w-full flex justify-end items-end p-3">
            <button onClick={() => handleGeneratePhase()} disabled={isPending || !inputValue.trim()} className="flex p-1 bg-gradient-to-t dark:from-gray-800 dark:via-gray-600 dark:to-gray-800 from-gray-400 via-gray-300 to-gray-500 rounded-lg shadow-inner border-none outline-none cursor-pointer transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              <i className="w-8 h-8 p-2 dark:bg-black/10 bg-white/20 rounded-lg backdrop-blur-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">{isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send size={20} className="transition-all duration-300 hover:text-gray-100 dark:hover:text-white hover:drop-shadow-[0_0_5px_#fff]" />}</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInput;
