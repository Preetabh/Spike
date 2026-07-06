"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initSocket } from "../sockets/socket";

const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [limit, setLimit] = useState(10);
  const [prevConvId, setPrevConvId] = useState(conversationId);

  // Reset limit on conversation change inline during render
  if (conversationId !== prevConvId) {
    setPrevConvId(conversationId);
    setLimit(10);
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["messages", conversationId, limit],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/messages/conversation/${conversationId}?limit=${limit}`,
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

  const [prevData, setPrevData] = useState(null);
  if (data && data !== prevData) {
    setPrevData(data);
    setMessages(data?.messages || data || []);
    console.log("Messages Loaded:", data);
  }

  useEffect(() => {
    if (!conversationId) return;

    const socket = initSocket();

    if (!socket) return;

    socket.emit("join-conversation", {
      conversationId,
    });

    // Mark messages as seen when joining conversation
    socket.emit("mark-seen", {
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

      // Mark the incoming message as seen since we are currently active in this conversation
      socket.emit("mark-seen", {
        conversationId,
      });
    };

    const handleMessageEdited = (updatedMessage) => {
      console.log("Realtime Message Edited:", updatedMessage);
      if (updatedMessage.conversationId !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    };

    const handleMessageDeleted = ({ messageId, conversationId: msgConvId }) => {
      console.log("Realtime Message Deleted:", messageId);
      if (msgConvId !== conversationId) return;

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    const handleReactionUpdated = ({ messageId, conversationId: msgConvId, action, reaction, userId, emoji }) => {
      console.log("Realtime Reaction Updated:", messageId, action);
      if (msgConvId !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          let newReactions = [...(msg.reactions || [])];
          if (action === "added") {
            const exists = newReactions.some((r) => r.id === reaction.id);
            if (!exists) newReactions.push(reaction);
          } else if (action === "removed") {
            newReactions = newReactions.filter(
              (r) => !(r.userId === userId && r.emoji === emoji)
            );
          }

          return {
            ...msg,
            reactions: newReactions,
          };
        })
      );
    };

    const handleMessagesSeen = ({ conversationId: msgConvId, userId: seenUserId, messageIds }) => {
      console.log("Realtime Messages Seen:", messageIds, "by:", seenUserId);
      if (msgConvId !== conversationId) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (messageIds.includes(msg.id)) {
            const seenBy = [...(msg.seenBy || [])];
            if (!seenBy.some((u) => u.id === seenUserId)) {
              seenBy.push({ id: seenUserId });
            }
            return {
              ...msg,
              seenBy,
            };
          }
          return msg;
        })
      );
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-edited", handleMessageEdited);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("reaction-updated", handleReactionUpdated);
    socket.on("messages-seen", handleMessagesSeen);

    return () => {
      socket.emit("leave-conversation", {
        conversationId,
      });
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-edited", handleMessageEdited);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("reaction-updated", handleReactionUpdated);
      socket.off("messages-seen", handleMessagesSeen);
    };
  }, [conversationId]);

  const loadMore = () => {
    setLimit((prev) => prev + 20);
  };

  const hasMore = messages.length >= limit;

  return {
    messages,
    isLoading,
    refetch,
    setMessages,
    loadMore,
    hasMore,
  };
};

export default useMessages;
