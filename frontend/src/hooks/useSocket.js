import { useEffect, useState } from "react";
import { getSocket, initSocket } from "../sockets/socket";

const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return {
    socket: getSocket(),
    connected,
  };
};

export default useSocket;
