"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initSocket } from "../sockets/socket";

const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/conversation/${conversationId}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      return res.json();
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (data) {
      setMessages(data?.messages || data || []);
      console.log("Messages Loaded:", data);
    }
  }, [data]);

  useEffect(() => {
    if (!conversationId) return;

    const socket = initSocket();

    if (!socket) return;

    socket.emit("join-conversation", {
      conversationId,
    });

    const handleReceiveMessage = (message) => {
      console.log("New Realtime Message:", message);
      if (message.conversationId !== conversationId) return;

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);

        if (exists) return prev;

        return [...prev, message];
      });
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.emit("leave-conversation", {
        conversationId,
      });
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [conversationId]);

  return {
    messages,
    isLoading,
    refetch,
    setMessages,
  };
};

export default useMessages;
