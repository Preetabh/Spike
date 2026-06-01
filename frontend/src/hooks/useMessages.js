import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { channelService } from "../services/channel.service";
import { dmService } from "../services/dm.service";
import { messageService } from "../services/message.service";
import { getSocket } from "../sockets/socket";

const getQueryKey = (roomId, isDM) => [
  isDM ? "dmMessages" : "channelMessages",
  roomId,
];

export const useMessages = ({ roomId, isDM }) => {
  const socket = getSocket();
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(roomId, isDM);

  const query = useQuery(
    queryKey,
    async () => {
      if (!roomId) return [];
      return isDM
        ? await dmService.getDMMessages(roomId)
        : await channelService.getChannelMessages(roomId);
    },
    {
      enabled: !!roomId,
      staleTime: 1000 * 30,
    }
  );

  useEffect(() => {
    if (!socket || !roomId) return;

    const roomName = isDM ? `dm_${roomId}` : `channel_${roomId}`;
    socket.emit(isDM ? "join-dm" : "join-channel", {
      [isDM ? "dmId" : "channelId"]: roomId,
    });

    const handleReceive = (message) => {
      queryClient.setQueryData(queryKey, (current = []) => {
        if (current.find((item) => item.id === message.id)) return current;
        return [...current, message];
      });
    };

    const handleEdited = (message) => {
      queryClient.setQueryData(queryKey, (current = []) =>
        current.map((item) =>
          item.id === message.id ? { ...item, ...message } : item
        )
      );
    };

    const handleDeleted = ({ messageId }) => {
      queryClient.setQueryData(queryKey, (current = []) =>
        current.map((item) =>
          item.id === messageId ? { ...item, isDeleted: true } : item
        )
      );
    };

    const handleReaction = (payload) => {
      queryClient.setQueryData(queryKey, (current = []) =>
        current.map((item) => {
          if (item.id !== payload.messageId) return item;
          const reactions =
            payload.action === "removed"
              ? item.reactions.filter(
                  (reaction) => reaction.id !== payload.reaction?.id
                )
              : [...(item.reactions || []), payload.reaction];
          return { ...item, reactions };
        })
      );
    };

    socket.on("receive-message", handleReceive);
    socket.on("message-edited", handleEdited);
    socket.on("message-deleted", handleDeleted);
    socket.on("message-reaction", handleReaction);

    return () => {
      socket.off("receive-message", handleReceive);
      socket.off("message-edited", handleEdited);
      socket.off("message-deleted", handleDeleted);
      socket.off("message-reaction", handleReaction);
      socket.emit(isDM ? "leave-dm" : "leave-channel", {
        [isDM ? "dmId" : "channelId"]: roomId,
      });
    };
  }, [socket, roomId, isDM, queryClient, queryKey]);

  const sendMessage = useMutation(
    async (payload) => {
      return isDM
        ? await dmService.sendDMMessage(roomId, payload)
        : await channelService.sendChannelMessage(roomId, payload);
    },
    {
      onMutate: async (newMessage) => {
        await queryClient.cancelQueries(queryKey);
        const previous = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old = []) => [
          ...old,
          {
            ...newMessage,
            id: `optimistic-${Date.now()}`,
            sender: { id: "me", fullName: "You", avatar: "" },
            createdAt: new Date().toISOString(),
            isSending: true,
          },
        ]);
        return { previous };
      },
      onError: (_error, _newMessage, context) => {
        queryClient.setQueryData(queryKey, context.previous);
      },
      onSuccess: (data) => {
        queryClient.setQueryData(queryKey, (old = []) =>
          old.map((item) =>
            item.id?.toString().startsWith("optimistic-") ? { ...data } : item
          )
        );
      },
    }
  );

  const editMessage = useMutation(
    async ({ messageId, content }) =>
      await messageService.editMessage(messageId, { content }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(queryKey, (current = []) =>
          current.map((item) =>
            item.id === data.id ? { ...item, ...data } : item
          )
        );
      },
    }
  );

  const deleteMessage = useMutation(
    async (messageId) => await messageService.deleteMessage(messageId),
    {
      onSuccess: (_, messageId) => {
        queryClient.setQueryData(queryKey, (current = []) =>
          current.map((item) =>
            item.id === messageId ? { ...item, isDeleted: true } : item
          )
        );
      },
    }
  );

  const reactMessage = useMutation(
    async ({ messageId, emoji }) =>
      await messageService.reactMessage(messageId, { emoji }),
    {
      onSuccess: () => {},
    }
  );

  return {
    ...query,
    sendMessage,
    editMessage,
    deleteMessage,
    reactMessage,
  };
};
