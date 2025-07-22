"use client";

import { defaultModel, modelID } from "@/ai/providers";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useMemo } from "react";
import { Textarea } from "./textarea";
import { ProjectOverview } from "./project-overview";
import { Messages } from "./messages";
import { Header } from "./header";
import { toast } from "sonner";

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState<modelID>(defaultModel);
  
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { selectedModel },
      }),
    [selectedModel]
  );

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onError: (error) => {
      toast.error(
        error.message.length > 0
          ? error.message
          : "An error occurred, please try again later.",
        { position: "top-center", richColors: true },
      );
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col justify-center w-full h-dvh stretch">
      <Header />
      {messages.length === 0 ? (
        <div className="mx-auto w-full max-w-xl">
          <ProjectOverview />
        </div>
      ) : (
        <Messages messages={messages} isLoading={isLoading} status={status} />
      )}
      <div className="px-4 pb-8 mx-auto w-full max-w-xl bg-white dark:bg-black sm:px-0">
        <Textarea
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onSubmit={(text: string) => sendMessage({ text })}
          isLoading={isLoading}
          status={status}
          stop={stop}
        />
      </div>
    </div>
  );
}
