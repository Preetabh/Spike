import { useEffect, useState } from "react";
import { getSocket } from "../sockets/socket";

const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    const handleOnline = ({ userId, online }) => {
      setOnlineUsers((current) => {
        if (online) {
          if (current.some((user) => user.userId === userId)) return current;
          return [...current, { userId, online }];
        }
        return current.filter((user) => user.userId !== userId);
      });
    };

    socket.on("online-users", handleOnline);

    return () => {
      socket.off("online-users", handleOnline);
    };
  }, [socket]);

  return {
    onlineUsers,
  };
};

export default usePresence;
