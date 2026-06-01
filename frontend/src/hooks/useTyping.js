import { useEffect, useState } from "react";
import { getSocket } from "../sockets/socket";

const useTyping = ({ roomId, roomType }) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleTyping = ({ user }) => {
      setTypingUsers((current) => {
        if (current.find((item) => item.id === user.id)) return current;
        return [...current, user];
      });
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers((current) => current.filter((user) => user.id !== userId));
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket, roomId, roomType]);

  const startTyping = () => {
    socket?.emit("typing-start", { roomId, roomType });
  };

  const stopTyping = () => {
    socket?.emit("typing-stop", { roomId, roomType });
  };

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
};

export default useTyping;
