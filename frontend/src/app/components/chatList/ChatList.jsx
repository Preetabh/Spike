"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import ChatListItem from "./ChatListItem";

const ChatList = ({ routeType = "dm" }) => {
  const router = useRouter();
  const params = useParams();

  const workspaceId = params?.id;

  const activeId = params?.memberId || params?.channelId || params?.groupId;

  const {
    data: chats = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [routeType, workspaceId],
    enabled: !!workspaceId,

    staleTime: 5 * 60 * 1000,
    refetchInterval: routeType === "dm" ? 10000 : false,
    gcTime: 30 * 60 * 1000,

    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL;

      if (!baseUrl) {
        throw new Error(
          "Missing NEXT_PUBLIC_API_BASE_URL / NEXT_PUBLIC_BASE_URL"
        );
      }

      let endpoint = "";

      switch (routeType) {
        case "dm":
          endpoint = `/api/v1/dm?workspaceId=${workspaceId}`;
          break;

        case "channels":
          endpoint = `/api/v1/channels?workspace=${workspaceId}`;
          break;

        case "groups":
          endpoint = `/api/v1/groups?workspace=${workspaceId}`;
          break;

        default:
          return [];
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        let details = response.statusText;

        try {
          const json = await response.clone().json();
          if (json?.message) details = json.message;
        } catch {
          details = await response.text();
        }

        if (response.status === 429) {
          throw new Error(
            "Too many requests. Please try again after 15 minutes."
          );
        }

        throw new Error(`Failed to fetch. ${details || "Please try again."}`);
      }

      const result = await response.json();

      if (Array.isArray(result)) {
        return result;
      }

      if (Array.isArray(result?.data)) {
        return result.data;
      }

      if (Array.isArray(result?.results)) {
        return result.results;
      }

      if (Array.isArray(result?.data?.items)) {
        return result.data.items;
      }

      return [];
    },
  });

  const handleNavigation = (chat) => {
    switch (routeType) {
      case "dm":
        router.push(`/workspace/${workspaceId}/dm/${chat.id}`);
        break;

      case "channels":
        router.push(`/workspace/${workspaceId}/channels/${chat.id}`);
        break;

      case "groups":
        router.push(`/workspace/${workspaceId}/groups/${chat.id}`);
        break;

      default:
        break;
    }
  };

  if (isLoading) {
    return <div className="p-4 text-sm">Loading conversations...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">
        {error.message || "Failed to fetch. Please try again."}
      </div>
    );
  }

  if (!Array.isArray(chats) || chats.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No conversations found
      </div>
    );
  }

  return (
    <div className="h-full pb-20 md:pb-15 overflow-y-auto bg-sidebar  no-scrollbar">
      <div className="flex flex-col">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={{
              id: chat.id,
              name: chat.fullName || chat.name,
              message: chat.email || chat.description || "",
              unread: 0,
              time: "",
              avatar: chat.avatar,
              isOnline: chat.isOnline,
            }}
            active={String(activeId) === String(chat.id)}
            onClick={() => handleNavigation(chat)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
