import { Server } from "socket.io";
import { vars } from "../constants/vars";

const io = new Server({
  cors: {
    // origin: vars.appLink,
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];

// const addUser = (userId, socketId) => {
//   !onlineUsers.some((user) => user.userId.userId === userId) &&
//     onlineUsers.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
// };

const getUser = (userId: string) => {
  return onlineUsers.find((user) => user.userId.userId === userId.toString());
};

// const getAllSocketIdsOfUser = (userId) => {
//   return onlineUsers.filter((user) => user.userId.userId === userId);
// };

const addUser = (userId, socketId) => {
  // if user is already in the list, we just add the socket id to the array of socket ids
  // else we add the user to the list and add the socket id to the array of socket ids
  const user = getUser(userId.userId);
  if (user) {
    user.socketId.push(socketId);
  } else {
    onlineUsers.push({ userId, socketId: [socketId] });
  }
};

const removeUser = (socketId) => {
  // we find which socket belong to which user
  // then we remove that socket from the user socket array
  onlineUsers = onlineUsers.filter((user) => {
    user.socketId = user.socketId.filter((soc) => soc !== socketId);
    return user.socketId.length > 0;
  });
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log("users", onlineUsers);
    io.emit("getUsers", onlineUsers);
  });

  socket.on(
    "sendMessage",
    ({ conversationId, senderId, receiverId, messageType, body }) => {
      // console.log("ReceiverId", receiverId);
      // console.log("sender", senderId);
      // console.log("body", body);
      const receiverUsers = getUser(receiverId);
      const senderUsers = getUser(senderId);
      //console.log("Receiver User", receiverUsers);
      //send message to all divices of receiver
      if (receiverUsers) {
        receiverUsers.socketId.forEach((soc) => {
          io.sockets.to(soc).emit("getMessage", {
            conversationId,
            senderId,
            receiverId,
            messageType,
            body,
          });
        });
      }
      //send message to all divices of sender
      senderUsers.socketId.forEach((soc) => {
        io.sockets.to(soc).emit("getMessage", {
          conversationId,
          senderId,
          receiverId,
          messageType,
          body,
        });
      });
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers);
  });
});
export { getUser };

export default io;
