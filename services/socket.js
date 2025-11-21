import { io } from "socket.io-client";
import Constants from "expo-constants";

const { BASE_URL } = Constants.expoConfig.extra;
let socketInstance = null;

export function getSocket(token) {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }
  socketInstance = io(BASE_URL, {
    transports: ["websocket"],
    auth: { token },
  });
  
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
