"use client";

import { useEffect } from "react";
import { initSocket } from "../sockets/socket";

const useConversationSocket = (
  conversationId
) => {
  useEffect(() => {
    if (!conversationId) return;

    const socket = initSocket();

    socket.emit("join-conversation", {
      conversationId,
    });

    return () => {
      socket.emit("leave-conversation", {
        conversationId,
      });
    };
  }, [conversationId]);
};

export default useConversationSocket;
